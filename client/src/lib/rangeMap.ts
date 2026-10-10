/** Maps a value linearly from the range [inMin, inMax] to the range [outMin, outMax]. */
export function rangeMap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
