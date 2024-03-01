// 2024.02.27 Atlee Brink
// WebAssembly handling.
// Copied then modified from my Circle Text project.

/* Example:

interface MyFunctions {
  addNumbers: (a: number, b: number) => number
  addFive: (a: number) => number
}

const myWasm = await loadWasm<MyFunctions>("mywasm.wasm")

let result = myWasm.fn.addNumbers(2, 3)

*/

export async function loadWasm<Functions>(filename: string) {
  const { instance } = await WebAssembly
    .instantiateStreaming(fetch(filename, { method: 'GET', credentials: 'include', mode: 'no-cors' }), {})
  return ({
    instance,
    mem: {
      initialOffset: (instance.exports.memory as WebAssembly.Memory).buffer.byteLength,
      memory: instance.exports.memory as WebAssembly.Memory,
    },
    fn: instance.exports as Functions
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