import { deflate } from "pako";
import { decodeShared, encodeShared } from "../shareCodec";

const value = {
  name: "Björk",
  nodes: [{ id: "artist/1", data: { label: "artist" } }],
};

describe("shareCodec", () => {
  it("round trips a value through the current format", () => {
    const encoded = encodeShared(value);
    expect(encoded.startsWith("b64:")).toBe(true);
    expect(JSON.parse(decodeShared(encoded))).toEqual(value);
  });

  it("reads the comma separated format of the pako 2 client", () => {
    const legacy = deflate(JSON.stringify(value)).toString();
    expect(JSON.parse(decodeShared(legacy))).toEqual(value);
  });

  it("reads the binary string format of the pako 1 client", () => {
    const bytes = deflate(JSON.stringify(value));
    const legacy = String.fromCharCode(...bytes);
    expect(JSON.parse(decodeShared(legacy))).toEqual(value);
  });

  it("encodes large payloads", () => {
    const large = {
      items: Array.from({ length: 20000 }, (_, index) => `node-${index}`),
    };
    expect(JSON.parse(decodeShared(encodeShared(large)))).toEqual(large);
  });
});
