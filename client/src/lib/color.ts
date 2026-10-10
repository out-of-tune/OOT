/** RRGGBBAA hex string (without `#`) of a color stored as a 32 bit RGBA integer, for example 0x009ee8ff. */
export function toHexColor(color: number): string {
  return (color >>> 0).toString(16).padStart(8, "0");
}

/** The same color with another alpha channel. `opacity` is two hex digits, for example "44". */
export function withOpacity(color: number, opacity: string): number {
  return parseInt(toHexColor(color).substring(0, 6) + opacity, 16);
}

/** Red, green, blue (0 to 255) and alpha (0 to 1) of a 32 bit RGBA color. */
export function rgbaParts(color: number): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const value = color >>> 0;
  return {
    r: (value >>> 24) & 0xff,
    g: (value >>> 16) & 0xff,
    b: (value >>> 8) & 0xff,
    a: (value & 0xff) / 0xff,
  };
}
