/** Resolves after the given number of milliseconds. */
export const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
