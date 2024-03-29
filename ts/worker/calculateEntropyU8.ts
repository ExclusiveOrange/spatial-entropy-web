// 2024.03.04 Atlee Brink

import { Job, JobResult } from "../common/Job.js"
import { MAX_KERNEL_RADIUS } from "../common/limits.js"
import { WasmMemory } from "./wasm.types.js"

import { spatial_entropy_u8 } from "../../c/spatial_entropy_u8.js";
import { makeWasmMemoryAtLeast } from "./wasm.js"
import { JobName_calculateEntropyU8, JobReturn_calculateEntropyU8, verifyJob_calculateEntropyU8 } from "../common/Job_calculateEntropyU8.js";

// specify the particular wasm function signature
export const WASM_IMPORTS = <const>{
  spatial_entropy_u8
}
type WasmImports = typeof WASM_IMPORTS

export const JOB_DISPATCH = <const>{
  [JobName_calculateEntropyU8]: calculateEntropyU8,
}

// precompute a log2 table since WebAssembly doesn't have a built-in log function
const log2Table: Float32Array = makeLog2Table((1 + 2 * MAX_KERNEL_RADIUS)**2)

function makeLog2Table(n: number): Float32Array {
  // n + 1 entries
  const table = new Float32Array(n + 1)
  table[0] = 0
  for (let i = 1; i <= n; ++i)
    table[i] = i * Math.log2(i)
  return table
}

function calculateEntropyU8(job: Job, wasmMemory: WasmMemory, wasmImports: WasmImports): JobResult<JobReturn_calculateEntropyU8> {
  if (!verifyJob_calculateEntropyU8(job))
    throw Error(`job parameter mismatch in perform_calculateEntropyU8()`)

  const
    arrayBuffer = job.jobArgs.arrayBuffer,
    inputArray = new Uint8Array(arrayBuffer)

  let memOffset = wasmMemory.initialOffset

  const log2TableOffset = memOffset
  memOffset += log2Table.BYTES_PER_ELEMENT * log2Table.length

  const inputArrayOffset = memOffset
  memOffset += inputArray.BYTES_PER_ELEMENT * inputArray.length

  const outputArrayOffset = memOffset
  memOffset += inputArray.BYTES_PER_ELEMENT * inputArray.length

  makeWasmMemoryAtLeast(wasmMemory.memory, memOffset)

  const wasmLog2Table = new Float32Array(wasmMemory.memory.buffer, log2TableOffset, log2Table.length)
  wasmLog2Table.set(log2Table)

  const wasmInputArray = new Uint8Array(wasmMemory.memory.buffer, inputArrayOffset, inputArray.length)
  wasmInputArray.set(inputArray)

  wasmImports.spatial_entropy_u8(
    job.jobArgs.kernelRadius,
    log2TableOffset,
    job.jobArgs.width,
    job.jobArgs.height,
    inputArrayOffset,
    outputArrayOffset,
  )

  const wasmOutputArray = new Uint8Array(wasmMemory.memory.buffer, outputArrayOffset, inputArray.length)
  inputArray.set(wasmOutputArray)

  return {
    return: { arrayBuffer },
    transferables: [arrayBuffer]
  }
}
