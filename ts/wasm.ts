// 2024.02.27 Atlee Brink
// WebAssembly handling.
// Copied then modified from my Circle Text project.

/* Example:

const Imports = <const>{
  addNumbers: (a: number, b: number) => 0,
  greet: (name: string) => "",
}

try {
  const myWasm = await loadWasm("mywasm.wasm", Imports)
}
catch (err) {
  console.err(`failed to load wasm: ${err.message}`)
}

let result = myWasm.fn.addNumbers(2, 3)

*/

export async function loadWasm
<ExpectedExports extends {[k in keyof any]: any}>
(
  filename: string,
  expectedExports: ExpectedExports
) {
  const { instance } = await WebAssembly.instantiateStreaming(fetch(filename, { method: 'GET', credentials: 'include', mode: 'no-cors' }), {})
  return ({
    instance,
    mem: {
      initialOffset: (instance.exports.memory as WebAssembly.Memory).buffer.byteLength,
      memory: instance.exports.memory as WebAssembly.Memory,
    },
    exports: getWasmExports<ExpectedExports>(expectedExports, instance.exports)
  })
}

export function makeWasmMemoryAtLeast(memory: WebAssembly.Memory, numBytes: number)
{
  const deficit = numBytes - memory.buffer.byteLength;
  if (deficit <= 0)
    return;

  const pageSize = 65536; // WebAssembly.Memory page size is always 64KiB
  const numPagesToGrow = Math.ceil(deficit / pageSize);
  const numBytesToGrow = numPagesToGrow * pageSize;

  console.log(`\
growing WebAssembly memory by \
${numPagesToGrow} page${numPagesToGrow === 1 ? '' : 's'} (${numBytesToGrow.toLocaleString()} bytes), \
new size ${(memory.buffer.byteLength + numBytesToGrow).toLocaleString()} bytes`);

  memory.grow(numPagesToGrow);
}

function getWasmExports
<Expected extends {[k in keyof any]: any}>
(
  expected: Expected,
  exports: WebAssembly.Exports
) {
  let ret: {[k in keyof any]: any} = {}

  Object.entries(expected).forEach(([key, value]) => {
    const expectedType = typeof value

    if (!(key in exports))
      throw Error(`wasm exports are missing: ${key}: ${expectedType}`)

    const exportedValue = exports[key]
    const actualType = typeof exportedValue

    if (actualType !== expectedType)
      throw Error(`wasm exports has: ${key}: ${actualType} but it should have type ${expectedType}`)

    ret[key] = exportedValue
  })

  return ret as Expected
}
