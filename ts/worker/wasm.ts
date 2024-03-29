// 2024.02.27 Atlee Brink
// WebAssembly handling.
// Copied then modified from my Circle Text project.

import { Wasm } from "./wasm.types.js"

/* Example:

const Imports = <const>{
  addNumbers: (a: number, b: number) => 0,
  greet: (name: string) => "",
}

try {
  const myWasm = await loadWasm("mywasm.wasm", Imports)
  let result = myWasm.imports.addNumbers(2, 3)
}
catch (err) {
  throw Error(`failed to load wasm: ${err.message}`, {cause: err})
}

*/

export async function loadWasm
<Imports extends {[k in keyof any]: any}>
(
  filename: string,
  imports: Imports
)
: Promise<Wasm<Imports>>
{
  const { instance } = await WebAssembly.instantiateStreaming(fetch(filename, { method: 'GET', credentials: 'include', mode: 'no-cors' }), {})
  return <const>{
    instance,
    memory: {
      initialOffset: (instance.exports.memory as WebAssembly.Memory).buffer.byteLength,
      memory: instance.exports.memory as WebAssembly.Memory,
    },
    imports: getWasmExports<Imports>(imports, instance.exports)
  }
}

export function makeWasmMemoryAtLeast(memory: WebAssembly.Memory, numBytes: number)
{
  const deficit = numBytes - memory.buffer.byteLength;
  if (deficit <= 0)
    return;

  const
    pageSize = 65536, // WebAssembly.Memory page size is always 64KiB
    numPagesToGrow = Math.ceil(deficit / pageSize),
    numBytesToGrow = numPagesToGrow * pageSize

  console.log(`growing WebAssembly memory by ${numPagesToGrow} page${numPagesToGrow === 1 ? '' : 's'} (${numBytesToGrow.toLocaleString()} bytes), new size ${(memory.buffer.byteLength + numBytesToGrow).toLocaleString()} bytes`);
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

    const
      exportedValue = exports[key],
      actualType = typeof exportedValue

    if (actualType !== expectedType)
      throw Error(`wasm exports has: ${key}: ${actualType} but it should have type ${expectedType}`)

    if (expectedType === 'function') {
      const
        expectedNumParams = value.length,
        actualNumParams = (exportedValue as Function).length

      if (actualNumParams !== expectedNumParams)
        throw Error(`exported function ${key} takes ${actualNumParams} parameters but should take ${expectedNumParams} parameters`)
    }

    ret[key] = exportedValue
  })

  return ret as Expected
}
