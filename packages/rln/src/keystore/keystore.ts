import type {
  ICipherModule,
  IKeystore as IEipKeystore,
  IPbkdf2KdfModule
} from "@chainsafe/bls-keystore";
import { create as createEipKeystore } from "@chainsafe/bls-keystore";
import { Logger } from "@waku/utils";
import { sha256 } from "ethereum-cryptography/sha256";
import {
  bytesToHex,
  bytesToUtf8,
  utf8ToBytes
} from "ethereum-cryptography/utils";
import _ from "lodash";
import { v4 as uuidV4 } from "uuid";

import { buildBigIntFromUint8Array } from "../utils/bytes.js";

import { decryptEipKeystore, keccak256Checksum } from "./cipher.js";
import { isCredentialValid, isKeystoreValid } from "./schema_validator.js";
import type {
  Keccak256Hash,
  KeystoreEntity,
  MembershipHash,
  MembershipInfo,
  Password,
  Sha256Hash
} from "./types.js";

const log = new Logger("waku:rln:keystore");

type NwakuCredential = {
  crypto: {
    cipher: ICipherModule["function"];
    cipherparams: ICipherModule["params"];
    ciphertext: ICipherModule["message"];
    kdf: IPbkdf2KdfModule["function"];
    kdfparams: IPbkdf2KdfModule["params"];
    mac: Sha256Hash;
  };
};

// examples from nwaku
// https://github.com/waku-org/nwaku/blob/f05528d4be3d3c876a8b07f9bb7dfaae8aa8ec6e/tests/test_waku_keystore.nim#L43
// https://github.com/waku-org/nwaku/blob/f05528d4be3d3c876a8b07f9bb7dfaae8aa8ec6e/waku/waku_keystore/keystore.nim#L154C35-L154C38
// important: each credential has it's own password
// important: not compatible with https://eips.ethereum.org/EIPS/eip-2335
interface NwakuKeystore {
  application: string;
  version: string;
  appIdentifier: string;
  credentials: {
    [key: MembershipHash]: NwakuCredential;
  };
}

type KeystoreCreateOptions = {
  application?: string;
  version?: string;
  appIdentifier?: string;
};

export class Keystore {
  private data: NwakuKeystore;

  private constructor(options: KeystoreCreateOptions | NwakuKeystore) {
    this.data = Object.assign(
      {
        application: "waku-rln-relay",
        appIdentifier: "01234567890abcdef",
        version: "0.2",
        credentials: {}
      },
      options
    );
  }

  public static create(options: KeystoreCreateOptions = {}): Keystore {
    return new Keystore(options);
  }

  // should be valid JSON string that contains Keystore file
  // https://github.com/waku-org/nwaku/blob/f05528d4be3d3c876a8b07f9bb7dfaae8aa8ec6e/waku/waku_keystore/keyfile.nim#L376
  public static fromString(str: string): undefined | Keystore {
    try {
      const obj = JSON.parse(str);

      if (!Keystore.isValidNwakuStore(obj)) {
        throw Error("Invalid string, does not match Nwaku Keystore format.");
      }

      return new Keystore(obj);
    } catch (err) {
      log.error("Cannot create Keystore from string:", err);
      return;
    }
  }

  public static fromObject(obj: NwakuKeystore): Keystore {
    if (!Keystore.isValidNwakuStore(obj)) {
      throw Error("Invalid object, does not match Nwaku Keystore format.");
    }

    return new Keystore(obj);
  }

  public async addCredential(
    options: KeystoreEntity,
    password: Password
  ): Promise<MembershipHash> {
    const membershipHash: MembershipHash = Keystore.computeMembershipHash(
      options.membership
    );

    if (this.data.credentials[membershipHash]) {
      throw Error("Credential already exists in the store.");
    }

    // these are not important
    const stubPath = "/stub/path";
    const stubPubkey = new Uint8Array([0]);
    const secret = Keystore.fromIdentityToBytes(options);

    const eipKeystore = await createEipKeystore(
      password,
      secret,
      stubPubkey,
      stubPath
    );
    // need to re-compute checksum since nwaku uses keccak256 instead of sha256
    const checksum = await keccak256Checksum(password, eipKeystore);
    const nwakuCredential = Keystore.fromEipToCredential(eipKeystore, checksum);

    this.data.credentials[membershipHash] = nwakuCredential;
    return membershipHash;
  }

  public async readCredential(
    membershipHash: MembershipHash,
    password: Password
  ): Promise<undefined | KeystoreEntity> {
    const nwakuCredential = this.data.credentials[membershipHash];

    if (!nwakuCredential) {
      return;
    }

    const eipKeystore = Keystore.fromCredentialToEip(nwakuCredential);
    const bytes = await decryptEipKeystore(password, eipKeystore);

    return Keystore.fromBytesToIdentity(bytes);
  }

  public removeCredential(hash: MembershipHash): void {
    if (!this.data.credentials[hash]) {
      return;
    }

    delete this.data.credentials[hash];
  }

  public toString(): string {
    return JSON.stringify(this.data);
  }

  public toObject(): NwakuKeystore {
    return this.data;
  }

  /**
   * Read array of hashes of current credentials
   * @returns array of keys of credentials in current Keystore
   */
  public keys(): string[] {
    return Object.keys(this.toObject().credentials || {});
  }

  private static isValidNwakuStore(obj: unknown): boolean {
    if (!isKeystoreValid(obj)) {
      return false;
    }

    const areCredentialsValid = Object.values(_.get(obj, "credentials", {}))
      .map((c) => isCredentialValid(c))
      .every((v) => v);

    return areCredentialsValid;
  }

  private static fromCredentialToEip(
    credential: NwakuCredential
  ): IEipKeystore {
    const nwakuCrypto = credential.crypto;
    const eipCrypto: IEipKeystore["crypto"] = {
      kdf: {
        function: nwakuCrypto.kdf,
        params: nwakuCrypto.kdfparams,
        message: ""
      },
      cipher: {
        function: nwakuCrypto.cipher,
        params: nwakuCrypto.cipherparams,
        message: nwakuCrypto.ciphertext
      },
      checksum: {
        // @chainsafe/bls-keystore supports only sha256
        // but nwaku uses keccak256
        // https://github.com/waku-org/nwaku/blob/25d6e52e3804d15f9b61bc4cc6dd448540c072a1/waku/waku_keystore/keyfile.nim#L367
        function: "sha256",
        params: {},
        message: nwakuCrypto.mac
      }
    };

    return {
      version: 4,
      uuid: uuidV4(),
      description: undefined,
      path: "safe to ignore, not important for decrypt",
      pubkey: "safe to ignore, not important for decrypt",
      crypto: eipCrypto
    };
  }

  private static fromEipToCredential(
    eipKeystore: IEipKeystore,
    checksum: Keccak256Hash
  ): NwakuCredential {
    const eipCrypto = eipKeystore.crypto;
    const eipKdf = eipCrypto.kdf as IPbkdf2KdfModule;
    return {
      crypto: {
        cipher: eipCrypto.cipher.function,
        cipherparams: eipCrypto.cipher.params,
        ciphertext: eipCrypto.cipher.message,
        kdf: eipKdf.function,
        kdfparams: eipKdf.params,
        // @chainsafe/bls-keystore generates only sha256
        // but nwaku uses keccak256
        // https://github.com/waku-org/nwaku/blob/25d6e52e3804d15f9b61bc4cc6dd448540c072a1/waku/waku_keystore/keyfile.nim#L367
        mac: checksum
      }
    };
  }

  private static fromBytesToIdentity(
    bytes: Uint8Array
  ): undefined | KeystoreEntity {
    try {
      const str = bytesToUtf8(bytes);
      const obj = JSON.parse(str);

      // TODO: add runtime validation of nwaku credentials
      return {
        identity: {
          IDCommitment: Keystore.fromArraylikeToBytes(
            _.get(obj, "identityCredential.idCommitment", [])
          ),
          IDTrapdoor: Keystore.fromArraylikeToBytes(
            _.get(obj, "identityCredential.idTrapdoor", [])
          ),
          IDNullifier: Keystore.fromArraylikeToBytes(
            _.get(obj, "identityCredential.idNullifier", [])
          ),
          IDCommitmentBigInt: buildBigIntFromUint8Array(
            Keystore.fromArraylikeToBytes(
              _.get(obj, "identityCredential.idCommitment", [])
            )
          ),
          IDSecretHash: Keystore.fromArraylikeToBytes(
            _.get(obj, "identityCredential.idSecretHash", [])
          )
        },
        membership: {
          treeIndex: _.get(obj, "treeIndex"),
          chainId: _.get(obj, "membershipContract.chainId"),
          address: _.get(obj, "membershipContract.address")
        }
      };
    } catch (err) {
      log.error("Cannot parse bytes to Nwaku Credentials:", err);
      return;
    }
  }

  private static fromArraylikeToBytes(obj: {
    [key: number]: number;
  }): Uint8Array {
    const bytes = [];

    let index = 0;
    let lastElement = obj[index];

    while (lastElement !== undefined) {
      bytes.push(lastElement);
      index += 1;
      lastElement = obj[index];
    }

    return new Uint8Array(bytes);
  }

  // follows nwaku implementation
  // https://github.com/waku-org/nwaku/blob/f05528d4be3d3c876a8b07f9bb7dfaae8aa8ec6e/waku/waku_keystore/protocol_types.nim#L111
  private static computeMembershipHash(info: MembershipInfo): MembershipHash {
    return bytesToHex(
      sha256(utf8ToBytes(`${info.chainId}${info.address}${info.treeIndex}`))
    ).toUpperCase();
  }

  // follows nwaku implementation
  // https://github.com/waku-org/nwaku/blob/f05528d4be3d3c876a8b07f9bb7dfaae8aa8ec6e/waku/waku_keystore/protocol_types.nim#L98
  private static fromIdentityToBytes(options: KeystoreEntity): Uint8Array {
    return utf8ToBytes(
      JSON.stringify({
        treeIndex: options.membership.treeIndex,
        identityCredential: {
          idCommitment: options.identity.IDCommitment,
          idNullifier: options.identity.IDNullifier,
          idSecretHash: options.identity.IDSecretHash,
          idTrapdoor: options.identity.IDTrapdoor
        },
        membershipContract: {
          chainId: options.membership.chainId,
          address: options.membership.address
        }
      })
    );
  }
}
