import { Logger } from "@waku/utils";

const DefaultEpochUnitSeconds = 10; // the rln-relay epoch length in seconds

const log = new Logger("waku:rln:epoch");

export function dateToEpoch(
  timestamp: Date,
  epochUnitSeconds: number = DefaultEpochUnitSeconds
): number {
  const time = timestamp.getTime();
  const epoch = Math.floor(time / 1000 / epochUnitSeconds);
  log.info("generated epoch", epoch);
  return epoch;
}

export function epochIntToBytes(epoch: number): Uint8Array {
  const bytes = new Uint8Array(32);
  const db = new DataView(bytes.buffer);
  db.setUint32(0, epoch, true);
  log.info("encoded epoch", epoch, bytes);
  return bytes;
}

export function epochBytesToInt(bytes: Uint8Array): number {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const epoch = dv.getUint32(0, true);
  log.info("decoded epoch", epoch, bytes);
  return epoch;
}
