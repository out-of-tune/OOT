const isPrimitive = (value: unknown) => value !== Object(value);

/** Structural equality for plain JSON-like values. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (isPrimitive(a) || isPrimitive(b)) return false;
  const objectA = a as Record<string, unknown>;
  const objectB = b as Record<string, unknown>;
  const keys = Object.keys(objectA);
  if (keys.length !== Object.keys(objectB).length) return false;
  return keys.every(
    (key) => key in objectB && deepEqual(objectA[key], objectB[key]),
  );
}
