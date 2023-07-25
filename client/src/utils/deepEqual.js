export function deepEqual(obj1, obj2) {
  function isPrimitive(obj) {
    return obj !== Object(obj);
  }
  if (obj1 === obj2)
    return true;
  if (isPrimitive(obj1) && isPrimitive(obj2))
    return obj1 === obj2;
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
  for (let key in obj1) {
    if (!(key in obj2)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}
