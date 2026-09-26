type ResolverMap = Record<string, Record<string, unknown>>;

/** Merges resolver maps type by type, for example two maps that both define `Query` fields. */
export function mergeResolvers(...maps: ResolverMap[]): ResolverMap {
  const merged: ResolverMap = {};
  for (const map of maps) {
    for (const [typeName, fields] of Object.entries(map)) {
      merged[typeName] = { ...merged[typeName], ...fields };
    }
  }
  return merged;
}
