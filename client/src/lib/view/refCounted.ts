/**
 * Values by key that several users share, for example one image for each URL. The first
 * `acquire` of a key creates the value; the last `release` disposes it.
 */
export function refCounted<T>(
  create: (key: string) => T,
  dispose: (value: T) => void,
) {
  const entries = new Map<string, { value: T; users: number }>();
  return {
    acquire(key: string): T {
      let entry = entries.get(key);
      if (!entry) {
        entry = { value: create(key), users: 0 };
        entries.set(key, entry);
      }
      entry.users += 1;
      return entry.value;
    },
    release(key: string) {
      const entry = entries.get(key);
      if (!entry) return;
      entry.users -= 1;
      if (entry.users > 0) return;
      dispose(entry.value);
      entries.delete(key);
    },
    /** Disposes every value, whoever still uses it. */
    clear() {
      entries.forEach((entry) => dispose(entry.value));
      entries.clear();
    },
  };
}
