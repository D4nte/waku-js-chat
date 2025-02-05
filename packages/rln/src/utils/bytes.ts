/**
 * Concatenate Uint8Arrays
 * @param input
 * @returns concatenation of all Uint8Array received as input
 */
export function concatenate(...input: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of input) {
    totalLength += arr.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of input) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// Adapted from https://github.com/feross/buffer
function checkInt(
  buf: Uint8Array,
  value: number,
  offset: number,
  ext: number,
  max: number,
  min: number
): void {
  if (value > max || value < min)
    throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError("Index out of range");
}

export function writeUIntLE(
  buf: Uint8Array,
  value: number,
  offset: number,
  byteLength: number,
  noAssert?: boolean
): Uint8Array {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(buf, value, offset, byteLength, maxBytes, 0);
  }

  let mul = 1;
  let i = 0;
  buf[offset] = value & 0xff;
  while (++i < byteLength && (mul *= 0x100)) {
    buf[offset + i] = (value / mul) & 0xff;
  }

  return buf;
}

/**
 * Transforms Uint8Array into BigInt
 * @param array: Uint8Array
 * @returns BigInt
 */
export function buildBigIntFromUint8Array(
  array: Uint8Array,
  byteOffset: number = 0
): bigint {
  const dataView = new DataView(array.buffer);
  return dataView.getBigUint64(byteOffset, true);
}

/**
 * Fills with zeros to set length
 * @param array little endian Uint8Array
 * @param length amount to pad
 * @returns little endian Uint8Array padded with zeros to set length
 */
export function zeroPadLE(array: Uint8Array, length: number): Uint8Array {
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = array[i] || 0;
  }
  return result;
}
