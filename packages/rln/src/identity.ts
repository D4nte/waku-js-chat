import { buildBigIntFromUint8Array } from "./utils/index.js";

export class IdentityCredential {
  public constructor(
    public readonly IDTrapdoor: Uint8Array,
    public readonly IDNullifier: Uint8Array,
    public readonly IDSecretHash: Uint8Array,
    public readonly IDCommitment: Uint8Array,
    public readonly IDCommitmentBigInt: bigint
  ) {}

  public static fromBytes(memKeys: Uint8Array): IdentityCredential {
    if (memKeys.length < 128) {
      throw new Error("Invalid memKeys length - must be at least 128 bytes");
    }

    const idTrapdoor = memKeys.subarray(0, 32);
    const idNullifier = memKeys.subarray(32, 64);
    const idSecretHash = memKeys.subarray(64, 96);
    const idCommitment = memKeys.subarray(96, 128);
    const idCommitmentBigInt = buildBigIntFromUint8Array(idCommitment, 32);

    return new IdentityCredential(
      idTrapdoor,
      idNullifier,
      idSecretHash,
      idCommitment,
      idCommitmentBigInt
    );
  }
}
