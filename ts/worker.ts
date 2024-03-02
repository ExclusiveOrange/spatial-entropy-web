// 2024.02.29 Atlee Brink

import { MAX_KERNEL_RADIUS } from "./limits.js";
import { makeLog2Table } from "./makeLog2Table.js";
import { loadWasm } from "./wasm.js";

interface Task {
  taskId: number // unique for each message
  functionName: string // should correspond with WASM_IMPORTS below
  args: any[]
  // TODO: how to deal with transferables, since some of the args are going to reference memory arrays,
  // but those arrays will need to be put into wasm memory before calling the wasm function
}

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

onmessage = async ({ data: task }: MessageEvent<Task>) => {

  // TODO: deal with message
  // EXPECTING: task id (number), function name (string) and args (any[]);
  //   then find function in wasm.exports,
  //   and call it with fn(...args),
  // FOR NOW don't need to worry about return value because I don't expect to return anything from a wasm function;
  // BUT will need to send a message back with the same task id to acknowledge that the call has completed.

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
