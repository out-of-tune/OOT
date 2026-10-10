/** Resolves after the time, in milliseconds. */
export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
