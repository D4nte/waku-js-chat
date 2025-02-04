import type { IRateLimitProof } from "@waku/interfaces";

import { concatenate, poseidonHash } from "./utils/index.js";

const proofOffset = 128;
const rootOffset = proofOffset + 32;
const epochOffset = rootOffset + 32;
const shareXOffset = epochOffset + 32;
const shareYOffset = shareXOffset + 32;
const nullifierOffset = shareYOffset + 32;
const rlnIdentifierOffset = nullifierOffset + 32;

class ProofMetadata {
  public constructor(
    public readonly nullifier: Uint8Array,
    public readonly shareX: Uint8Array,
    public readonly shareY: Uint8Array,
    public readonly externalNullifier: Uint8Array
  ) {}
}

export class Proof implements IRateLimitProof {
  public readonly proof: Uint8Array;
  public readonly merkleRoot: Uint8Array;
  public readonly epoch: Uint8Array;
  public readonly shareX: Uint8Array;
  public readonly shareY: Uint8Array;
  public readonly nullifier: Uint8Array;
  public readonly rlnIdentifier: Uint8Array;

  public constructor(proofBytes: Uint8Array) {
    if (proofBytes.length < rlnIdentifierOffset) {
      throw new Error("invalid proof");
    }
    // parse the proof as proof<128> | share_y<32> | nullifier<32> | root<32> | epoch<32> | share_x<32> | rln_identifier<32>
    this.proof = proofBytes.subarray(0, proofOffset);
    this.merkleRoot = proofBytes.subarray(proofOffset, rootOffset);
    this.epoch = proofBytes.subarray(rootOffset, epochOffset);
    this.shareX = proofBytes.subarray(epochOffset, shareXOffset);
    this.shareY = proofBytes.subarray(shareXOffset, shareYOffset);
    this.nullifier = proofBytes.subarray(shareYOffset, nullifierOffset);
    this.rlnIdentifier = proofBytes.subarray(
      nullifierOffset,
      rlnIdentifierOffset
    );
  }

  public extractMetadata(): ProofMetadata {
    const externalNullifier = poseidonHash(this.epoch, this.rlnIdentifier);
    return new ProofMetadata(
      this.nullifier,
      this.shareX,
      this.shareY,
      externalNullifier
    );
  }
}

export function proofToBytes(p: IRateLimitProof): Uint8Array {
  return concatenate(
    p.proof,
    p.merkleRoot,
    p.epoch,
    p.shareX,
    p.shareY,
    p.nullifier,
    p.rlnIdentifier
  );
}
