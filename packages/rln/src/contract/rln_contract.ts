import { Logger } from "@waku/utils";
import { hexToBytes } from "@waku/utils/bytes";
import { ethers } from "ethers";

import type { IdentityCredential } from "../identity.js";
import type { DecryptedCredentials } from "../keystore/index.js";
import type { RLNInstance } from "../rln.js";
import { MerkleRootTracker } from "../root_tracker.js";
import { zeroPadLE } from "../utils/index.js";

import { RLN_REGISTRY_ABI, RLN_STORAGE_ABI } from "./constants.js";

const log = new Logger("waku:rln:contract");

type Member = {
  idCommitment: string;
  index: ethers.BigNumber;
};

type Signer = ethers.Signer;

type RLNContractOptions = {
  signer: Signer;
  registryAddress: string;
};

type RLNStorageOptions = {
  storageIndex?: number;
};

type RLNContractInitOptions = RLNContractOptions & RLNStorageOptions;

type FetchMembersOptions = {
  fromBlock?: number;
  fetchRange?: number;
  fetchChunks?: number;
};

export class RLNContract {
  private registryContract: ethers.Contract;
  private merkleRootTracker: MerkleRootTracker;

  private deployBlock: undefined | number;
  private storageIndex: undefined | number;
  private storageContract: undefined | ethers.Contract;
  private _membersFilter: undefined | ethers.EventFilter;

  private _members: Map<number, Member> = new Map();

  public static async init(
    rlnInstance: RLNInstance,
    options: RLNContractInitOptions
  ): Promise<RLNContract> {
    const rlnContract = new RLNContract(rlnInstance, options);

    await rlnContract.initStorageContract(options.signer);
    await rlnContract.fetchMembers(rlnInstance);
    rlnContract.subscribeToMembers(rlnInstance);

    return rlnContract;
  }

  public constructor(
    rlnInstance: RLNInstance,
    { registryAddress, signer }: RLNContractOptions
  ) {
    const initialRoot = rlnInstance.zerokit.getMerkleRoot();

    this.registryContract = new ethers.Contract(
      registryAddress,
      RLN_REGISTRY_ABI,
      signer
    );
    this.merkleRootTracker = new MerkleRootTracker(5, initialRoot);
  }

  private async initStorageContract(
    signer: Signer,
    options: RLNStorageOptions = {}
  ): Promise<void> {
    const storageIndex = options?.storageIndex
      ? options.storageIndex
      : await this.registryContract.usingStorageIndex();
    const storageAddress = await this.registryContract.storages(storageIndex);

    if (!storageAddress || storageAddress === ethers.constants.AddressZero) {
      throw Error("No RLN Storage initialized on registry contract.");
    }

    this.storageIndex = storageIndex;
    this.storageContract = new ethers.Contract(
      storageAddress,
      RLN_STORAGE_ABI,
      signer
    );
    this._membersFilter = this.storageContract.filters.MemberRegistered();

    this.deployBlock = await this.storageContract.deployedBlockNumber();
  }

  public get registry(): ethers.Contract {
    if (!this.registryContract) {
      throw Error("Registry contract was not initialized");
    }
    return this.registryContract as ethers.Contract;
  }

  public get contract(): ethers.Contract {
    if (!this.storageContract) {
      throw Error("Storage contract was not initialized");
    }
    return this.storageContract as ethers.Contract;
  }

  public get members(): Member[] {
    const sortedMembers = Array.from(this._members.values()).sort(
      (left, right) => left.index.toNumber() - right.index.toNumber()
    );
    return sortedMembers;
  }

  private get membersFilter(): ethers.EventFilter {
    if (!this._membersFilter) {
      throw Error("Members filter was not initialized.");
    }
    return this._membersFilter as ethers.EventFilter;
  }

  public async fetchMembers(
    rlnInstance: RLNInstance,
    options: FetchMembersOptions = {}
  ): Promise<void> {
    const registeredMemberEvents = await queryFilter(this.contract, {
      fromBlock: this.deployBlock,
      ...options,
      membersFilter: this.membersFilter
    });
    this.processEvents(rlnInstance, registeredMemberEvents);
  }

  public processEvents(rlnInstance: RLNInstance, events: ethers.Event[]): void {
    const toRemoveTable = new Map<number, number[]>();
    const toInsertTable = new Map<number, ethers.Event[]>();

    events.forEach((evt) => {
      if (!evt.args) {
        return;
      }

      if (evt.removed) {
        const index: ethers.BigNumber = evt.args.index;
        const toRemoveVal = toRemoveTable.get(evt.blockNumber);
        if (toRemoveVal != undefined) {
          toRemoveVal.push(index.toNumber());
          toRemoveTable.set(evt.blockNumber, toRemoveVal);
        } else {
          toRemoveTable.set(evt.blockNumber, [index.toNumber()]);
        }
      } else {
        let eventsPerBlock = toInsertTable.get(evt.blockNumber);
        if (eventsPerBlock == undefined) {
          eventsPerBlock = [];
        }

        eventsPerBlock.push(evt);
        toInsertTable.set(evt.blockNumber, eventsPerBlock);
      }
    });

    this.removeMembers(rlnInstance, toRemoveTable);
    this.insertMembers(rlnInstance, toInsertTable);
  }

  private insertMembers(
    rlnInstance: RLNInstance,
    toInsert: Map<number, ethers.Event[]>
  ): void {
    toInsert.forEach((events: ethers.Event[], blockNumber: number) => {
      events.forEach((evt) => {
        const _idCommitment = evt?.args?.idCommitment;
        const index: ethers.BigNumber = evt?.args?.index;

        if (!_idCommitment || !index) {
          return;
        }

        const idCommitment = zeroPadLE(hexToBytes(_idCommitment?._hex), 32);
        rlnInstance.zerokit.insertMember(idCommitment);
        this._members.set(index.toNumber(), {
          index,
          idCommitment: _idCommitment?._hex
        });
      });

      const currentRoot = rlnInstance.zerokit.getMerkleRoot();
      this.merkleRootTracker.pushRoot(blockNumber, currentRoot);
    });
  }

  private removeMembers(
    rlnInstance: RLNInstance,
    toRemove: Map<number, number[]>
  ): void {
    const removeDescending = new Map([...toRemove].sort().reverse());
    removeDescending.forEach((indexes: number[], blockNumber: number) => {
      indexes.forEach((index) => {
        if (this._members.has(index)) {
          this._members.delete(index);
          rlnInstance.zerokit.deleteMember(index);
        }
      });

      this.merkleRootTracker.backFill(blockNumber);
    });
  }

  public subscribeToMembers(rlnInstance: RLNInstance): void {
    this.contract.on(this.membersFilter, (_pubkey, _index, event) =>
      this.processEvents(rlnInstance, [event])
    );
  }

  public async registerWithIdentity(
    identity: IdentityCredential
  ): Promise<DecryptedCredentials | undefined> {
    if (this.storageIndex === undefined) {
      throw Error(
        "Cannot register credential, no storage contract index found."
      );
    }
    const txRegisterResponse: ethers.ContractTransaction =
      await this.registryContract["register(uint16,uint256)"](
        this.storageIndex,
        identity.IDCommitmentBigInt,
        { gasLimit: 100000 }
      );
    const txRegisterReceipt = await txRegisterResponse.wait();

    // assumption: register(uint16,uint256) emits one event
    const memberRegistered = txRegisterReceipt?.events?.[0];

    if (!memberRegistered) {
      return undefined;
    }

    const decodedData = this.contract.interface.decodeEventLog(
      "MemberRegistered",
      memberRegistered.data
    );

    const network = await this.registryContract.provider.getNetwork();
    const address = this.registryContract.address;
    const membershipId = decodedData.index.toNumber();

    return {
      identity,
      membership: {
        address,
        treeIndex: membershipId,
        chainId: network.chainId
      }
    };
  }

  public roots(): Uint8Array[] {
    return this.merkleRootTracker.roots();
  }
}

type CustomQueryOptions = FetchMembersOptions & {
  membersFilter: ethers.EventFilter;
};

// these value should be tested on other networks
const FETCH_CHUNK = 5;
const BLOCK_RANGE = 3000;

async function queryFilter(
  contract: ethers.Contract,
  options: CustomQueryOptions
): Promise<ethers.Event[]> {
  const {
    fromBlock,
    membersFilter,
    fetchRange = BLOCK_RANGE,
    fetchChunks = FETCH_CHUNK
  } = options;

  if (!fromBlock) {
    return contract.queryFilter(membersFilter);
  }

  if (!contract.signer.provider) {
    throw Error("No provider found on the contract's signer.");
  }

  const toBlock = await contract.signer.provider.getBlockNumber();

  if (toBlock - fromBlock < fetchRange) {
    return contract.queryFilter(membersFilter);
  }

  const events: ethers.Event[][] = [];
  const chunks = splitToChunks(fromBlock, toBlock, fetchRange);

  for (const portion of takeN<[number, number]>(chunks, fetchChunks)) {
    const promises = portion.map(([left, right]) =>
      ignoreErrors(contract.queryFilter(membersFilter, left, right), [])
    );
    const fetchedEvents = await Promise.all(promises);
    events.push(fetchedEvents.flatMap((v) => v));
  }

  return events.flatMap((v) => v);
}

function splitToChunks(
  from: number,
  to: number,
  step: number
): Array<[number, number]> {
  const chunks = [];

  let left = from;
  while (left < to) {
    const right = left + step < to ? left + step : to;

    chunks.push([left, right] as [number, number]);

    left = right;
  }

  return chunks;
}

function* takeN<T>(array: T[], size: number): Iterable<T[]> {
  let start = 0;

  while (start < array.length) {
    const portion = array.slice(start, start + size);

    yield portion;

    start += size;
  }
}

function ignoreErrors<T>(promise: Promise<T>, defaultValue: T): Promise<T> {
  return promise.catch((err) => {
    log.info(`Ignoring an error during query: ${err?.message}`);
    return defaultValue;
  });
}
