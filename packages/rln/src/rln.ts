import { createDecoder, createEncoder } from "@waku/core";
import type {
  ContentTopic,
  IDecodedMessage,
  EncoderOptions as WakuEncoderOptions
} from "@waku/interfaces";
import init from "@waku/zerokit-rln-wasm";
import * as zerokitRLN from "@waku/zerokit-rln-wasm";
import { ethers } from "ethers";

import {
  createRLNDecoder,
  createRLNEncoder,
  type RLNDecoder,
  type RLNEncoder
} from "./codec.js";
import { RLNContract, SEPOLIA_CONTRACT } from "./contract/index.js";
import { IdentityCredential } from "./identity.js";
import { Keystore } from "./keystore/index.js";
import type {
  DecryptedCredentials,
  EncryptedCredentials
} from "./keystore/index.js";
import { KeystoreEntity, Password } from "./keystore/types.js";
import verificationKey from "./resources/verification_key";
import * as wc from "./resources/witness_calculator";
import { WitnessCalculator } from "./resources/witness_calculator";
import { extractMetaMaskSigner } from "./utils/index.js";
import { Zerokit } from "./zerokit.js";

async function loadWitnessCalculator(): Promise<WitnessCalculator> {
  const url = new URL("./resources/rln.wasm", import.meta.url);
  const response = await fetch(url);
  return await wc.builder(new Uint8Array(await response.arrayBuffer()), false);
}

async function loadZkey(): Promise<Uint8Array> {
  const url = new URL("./resources/rln_final.zkey", import.meta.url);
  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Create an instance of RLN
 * @returns RLNInstance
 */
export async function create(): Promise<RLNInstance> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (init as any)?.();
  zerokitRLN.init_panic_hook();

  const witnessCalculator = await loadWitnessCalculator();
  const zkey = await loadZkey();

  const stringEncoder = new TextEncoder();
  const vkey = stringEncoder.encode(JSON.stringify(verificationKey));

  const DEPTH = 20;
  const zkRLN = zerokitRLN.newRLN(DEPTH, zkey, vkey);
  const zerokit = new Zerokit(zkRLN, witnessCalculator);

  return new RLNInstance(zerokit);
}

type StartRLNOptions = {
  /**
   * If not set - will extract MetaMask account and get signer from it.
   */
  signer?: ethers.Signer;
  /**
   * If not set - will use default SEPOLIA_CONTRACT address.
   */
  registryAddress?: string;
  /**
   * Credentials to use for generating proofs and connecting to the contract and network.
   * If provided used for validating the network chainId and connecting to registry contract.
   */
  credentials?: EncryptedCredentials | DecryptedCredentials;
};

type RegisterMembershipOptions =
  | { signature: string }
  | { identity: IdentityCredential };

type WakuRLNEncoderOptions = WakuEncoderOptions & {
  credentials: EncryptedCredentials | DecryptedCredentials;
};

export class RLNInstance {
  private started = false;
  private starting = false;

  private _contract: undefined | RLNContract;
  private _signer: undefined | ethers.Signer;

  private keystore = Keystore.create();
  private _credentials: undefined | DecryptedCredentials;

  public constructor(public zerokit: Zerokit) {}

  public get contract(): undefined | RLNContract {
    return this._contract;
  }

  public get signer(): undefined | ethers.Signer {
    return this._signer;
  }

  public async start(options: StartRLNOptions = {}): Promise<void> {
    if (this.started || this.starting) {
      return;
    }

    this.starting = true;

    try {
      const { credentials, keystore } =
        await RLNInstance.decryptCredentialsIfNeeded(options.credentials);
      const { signer, registryAddress } = await this.determineStartOptions(
        options,
        credentials
      );

      if (keystore) {
        this.keystore = keystore;
      }

      this._credentials = credentials;
      this._signer = signer!;
      this._contract = await RLNContract.init(this, {
        registryAddress: registryAddress!,
        signer: signer!
      });
      this.started = true;
    } finally {
      this.starting = false;
    }
  }

  private async determineStartOptions(
    options: StartRLNOptions,
    credentials: KeystoreEntity | undefined
  ): Promise<StartRLNOptions> {
    let chainId = credentials?.membership.chainId;
    const registryAddress =
      credentials?.membership.address ||
      options.registryAddress ||
      SEPOLIA_CONTRACT.address;

    if (registryAddress === SEPOLIA_CONTRACT.address) {
      chainId = SEPOLIA_CONTRACT.chainId;
    }

    const signer = options.signer || (await extractMetaMaskSigner());
    const currentChainId = await signer.getChainId();

    if (chainId && chainId !== currentChainId) {
      throw Error(
        `Failed to start RLN contract, chain ID of contract is different from current one: contract-${chainId}, current network-${currentChainId}`
      );
    }

    return {
      signer,
      registryAddress
    };
  }

  private static async decryptCredentialsIfNeeded(
    credentials?: EncryptedCredentials | DecryptedCredentials
  ): Promise<{ credentials?: DecryptedCredentials; keystore?: Keystore }> {
    if (!credentials) {
      return {};
    }

    if ("identity" in credentials) {
      return { credentials };
    }

    const keystore = Keystore.fromString(credentials.keystore);

    if (!keystore) {
      return {};
    }

    const decryptedCredentials = await keystore.readCredential(
      credentials.id,
      credentials.password
    );

    return {
      keystore,
      credentials: decryptedCredentials
    };
  }

  public async registerMembership(
    options: RegisterMembershipOptions
  ): Promise<undefined | DecryptedCredentials> {
    if (!this.contract) {
      throw Error("RLN Contract is not initialized.");
    }

    let identity = "identity" in options && options.identity;

    if ("signature" in options) {
      identity = this.zerokit.generateSeededIdentityCredential(
        options.signature
      );
    }

    if (!identity) {
      throw Error("Missing signature or identity to register membership.");
    }

    return this.contract.registerWithIdentity(identity);
  }

  /**
   * Changes credentials in use by relying on provided Keystore earlier in rln.start
   * @param id: string, hash of credentials to select from Keystore
   * @param password: string or bytes to use to decrypt credentials from Keystore
   */
  public async useCredentials(id: string, password: Password): Promise<void> {
    this._credentials = await this.keystore?.readCredential(id, password);
  }

  public async createEncoder(
    options: WakuRLNEncoderOptions
  ): Promise<RLNEncoder> {
    const { credentials: decryptedCredentials } =
      await RLNInstance.decryptCredentialsIfNeeded(options.credentials);
    const credentials = decryptedCredentials || this._credentials;

    if (!credentials) {
      throw Error(
        "Failed to create Encoder: missing RLN credentials. Use createRLNEncoder directly."
      );
    }

    await this.verifyCredentialsAgainstContract(credentials);

    return createRLNEncoder({
      encoder: createEncoder(options),
      rlnInstance: this,
      index: credentials.membership.treeIndex,
      credential: credentials.identity
    });
  }

  private async verifyCredentialsAgainstContract(
    credentials: KeystoreEntity
  ): Promise<void> {
    if (!this._contract) {
      throw Error(
        "Failed to verify chain coordinates: no contract initialized."
      );
    }

    const registryAddress = credentials.membership.address;
    const currentRegistryAddress = this._contract.registry.address;
    if (registryAddress !== currentRegistryAddress) {
      throw Error(
        `Failed to verify chain coordinates: credentials contract address=${registryAddress} is not equal to registryContract address=${currentRegistryAddress}`
      );
    }

    const chainId = credentials.membership.chainId;
    const network = await this._contract.registry.provider.getNetwork();
    const currentChainId = network.chainId;
    if (chainId !== currentChainId) {
      throw Error(
        `Failed to verify chain coordinates: credentials chainID=${chainId} is not equal to registryContract chainID=${currentChainId}`
      );
    }
  }

  public createDecoder(
    contentTopic: ContentTopic
  ): RLNDecoder<IDecodedMessage> {
    return createRLNDecoder({
      rlnInstance: this,
      decoder: createDecoder(contentTopic)
    });
  }
}
