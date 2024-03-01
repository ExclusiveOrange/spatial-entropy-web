// 2024.03.01 Atlee Brink
//
// A utility function that applies the given function to each value of a const enum,
// and returns a fully typed object that maps each const enum value to a type.
//
// Requires: a const enum, and a type map (interface) correlating each enum value to a type.
//
// Use caution because limitations in TypeScript's support for const enum means the return type is coerced
// and will be wrong if your given function returns the wrong type.

/* Example:

const enum Keys {
  A = 0,
  B = 1,
  LAST = B
}

interface Types {
  [Keys.A]: number
  [Keys.B]: string
}

function getVal(key: Keys): any {
  switch(key) {
    case Keys.A: return 5;
    case Keys.B: return "hello";
  }
}

const results = applyConstEnum<Keys, Types>(Keys.LAST, getVal);
let a = results[Keys.A] // a: number
let b = results[Keys.B] // b: string

*/

// it's up to you to make sure fn returns the proper type for the given key, typescript is limited here
function applyConstEnum<E extends number, TypeMap extends {[k in E]: any}>(last: number, fn: (e: E) => any) {
  let ret: {[k in number]: any} = {}
  for (let i = 0; i <= last; ++i)
    ret[i] = fn(i as E)
  return ret as {[e in E]: TypeMap[e]}
}
