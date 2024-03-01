// 2024.02.29 Atlee Brink

import { MAX_KERNEL_RADIUS } from "./limits.js";
import { makeLog2Table } from "./makeLog2Table.js";
import { loadWasm } from "./wasm.js";

import { spatial_entropy_u8 } from "../c/spatial_entropy_u8.js"

const log2Table: Float32Array = makeLog2Table((1 + 2 * MAX_KERNEL_RADIUS)**2)

console.log(`worker: loading wasm from server...`)
const wasmPromise = loadWasm<{
  spatial_entropy_u8: spatial_entropy_u8
}>("wasm.wasm")

let wasm: Awaited<typeof wasmPromise> | null = null

onmessage = async ({ data: message }: MessageEvent<string>) => {
  console.log(`worker got message: ${message}`)
  if (!wasm) {
    wasm = await wasmPromise
    console.log(`worker: wasm loaded!`)
  }
}