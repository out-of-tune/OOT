import { deflate, inflate } from "pako";

const BASE64_PREFIX = "b64:";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

/** Compresses a JSON value for the share service. */
export function encodeShared(value: unknown): string {
  return BASE64_PREFIX + bytesToBase64(deflate(JSON.stringify(value)));
}

/**
 * Decompresses a payload from the share service and returns the JSON text.
 * It reads three formats:
 * 1. `b64:` followed by base64 (the current format).
 * 2. A comma separated list of byte values. The pako 2 client wrote this by mistake.
 * 3. A binary string with one character per byte. The pako 1 client wrote this.
 */
export function decodeShared(payload: string): string {
  let bytes: Uint8Array;
  if (payload.startsWith(BASE64_PREFIX)) {
    bytes = base64ToBytes(payload.slice(BASE64_PREFIX.length));
  } else if (/^\d{1,3}(,\d{1,3})*$/.test(payload)) {
    bytes = Uint8Array.from(payload.split(","), Number);
  } else {
    bytes = Uint8Array.from(payload, (char) => char.charCodeAt(0) & 0xff);
  }
  return new TextDecoder().decode(inflate(bytes));
}
