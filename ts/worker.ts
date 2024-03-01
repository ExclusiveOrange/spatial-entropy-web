// 2024.02.29 Atlee Brink

import { MAX_KERNEL_RADIUS } from "./limits.js";
import { makeLog2Table } from "./makeLog2Table.js";
import { loadWasm } from "./wasm.js";

// WASM function signatures
import { spatial_entropy_u8 } from "./wasm/spatial_entropy_u8.js"

const WASM_FILENAME = "wasm.wasm"
const WASM_IMPORTS = <const>{
  spatial_entropy_u8
}

console.log(`worker: loading wasm from server...`)
const wasmPromise = loadWasm(WASM_FILENAME, WASM_IMPORTS)
let wasm: Awaited<typeof wasmPromise> | null = null

const log2Table: Float32Array = makeLog2Table((1 + 2 * MAX_KERNEL_RADIUS)**2)

onmessage = async ({ data: message }: MessageEvent<string>) => {
  console.log(`worker got message: ${message}`)
  if (!wasm) {
    try {
      wasm = await wasmPromise
      console.log(`worker: wasm loaded!`)
    }
    catch (err) {
      const message = err instanceof Error ? err.message : err
      console.error(`couldn't load wasm file "${WASM_FILENAME}" because ${message}`)
    }
  }
}

function makeEmptyFunction<Fn extends (...args: any) => any>() {
  return (...args: Parameters<Fn>): ReturnType<Fn> => { return 0 as ReturnType<Fn> }
}
