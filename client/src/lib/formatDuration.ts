/** Formats seconds as minutes and seconds, for example 125 as "2:05". */
export function formatDuration(seconds: number): string {
  const whole = Math.max(Math.floor(seconds), 0);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
