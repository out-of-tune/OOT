/** RRGGBBAA hex string (without `#`) of a color stored as a 32 bit RGBA integer, for example 0x009ee8ff. */
export function toHexColor(color: number): string {
  return (color >>> 0).toString(16).padStart(8, "0");
}

/** The same color with another alpha channel. `opacity` is two hex digits, for example "44". */
export function withOpacity(color: number, opacity: string): number {
  return parseInt(toHexColor(color).substring(0, 6) + opacity, 16);
}
