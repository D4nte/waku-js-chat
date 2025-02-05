import type { IKeystore as IEipKeystore } from "@chainsafe/bls-keystore";
import { cipherDecrypt } from "@chainsafe/bls-keystore/lib/cipher";
import { kdf } from "@chainsafe/bls-keystore/lib/kdf";
import { normalizePassword } from "@chainsafe/bls-keystore/lib/password";
import { keccak256 } from "ethereum-cryptography/keccak";
import {
  bytesToHex,
  concatBytes,
  hexToBytes
} from "ethereum-cryptography/utils";

import type { Keccak256Hash, Password } from "./types.js";

// eipKeystore supports only sha256 checksum so we just make an assumption it is keccak256
const validateChecksum = async (
  password: Password,
  eipKeystore: IEipKeystore
): Promise<boolean> => {
  const computedChecksum = await keccak256Checksum(password, eipKeystore);
  return computedChecksum === eipKeystore.crypto.checksum.message;
};

// decrypt from @chainsafe/bls-keystore supports only sha256
// but nwaku uses keccak256
// https://github.com/waku-org/nwaku/blob/25d6e52e3804d15f9b61bc4cc6dd448540c072a1/waku/waku_keystore/keyfile.nim#L367
export const decryptEipKeystore = async (
  password: Password,
  eipKeystore: IEipKeystore
): Promise<Uint8Array> => {
  const decryptionKey = await kdf(
    eipKeystore.crypto.kdf,
    normalizePassword(password)
  );
  const isChecksumValid = await validateChecksum(password, eipKeystore);

  if (!isChecksumValid) {
    throw Error("Password is invalid.");
  }

  return cipherDecrypt(eipKeystore.crypto.cipher, decryptionKey.slice(0, 16));
};

export const keccak256Checksum = async (
  password: Password,
  eipKeystore: IEipKeystore
): Promise<Keccak256Hash> => {
  const key = await kdf(eipKeystore.crypto.kdf, normalizePassword(password));
  const payload = concatBytes(
    key.slice(16),
    hexToBytes(eipKeystore.crypto.cipher.message)
  );
  const ciphertext = keccak256(payload);
  return bytesToHex(ciphertext);
};
