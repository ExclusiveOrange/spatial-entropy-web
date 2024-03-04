// 2024.02.29 Atlee Brink

import { MAX_KERNEL_RADIUS } from "./limits.js";
import { makeLog2Table } from "./makeLog2Table.js";
import { loadWasm, makeWasmMemoryAtLeast } from "./wasm.js";
import { Job, JobError, JobSuccess, JobUID } from "./WorkerJob.js";

// WASM function signatures
import { spatial_entropy_u8 } from "../c/spatial_entropy_u8.js";
import { Job_spatial_entropy_u8, JobReturn_spatial_entropy_u8, JobSuccess_spatial_entropy_u8 } from "./WorkerJobs.js";

const WASM_FILENAME = "wasm.wasm"
const WASM_IMPORTS = <const>{
  spatial_entropy_u8,
}
type JOB_NAME = keyof typeof WASM_IMPORTS

type JobResult<ReturnType = { return: any }> = ReturnType & { transferables?: Transferable[] }

const JobDispatch: {[name in JOB_NAME]: (job: Job, wasm: Wasm) => JobResult} = <const>{
  spatial_entropy_u8: perform_spatial_entropy_u8,
}

// start loading (fetching) the WebAssembly file immediately
console.log(`worker: loading wasm from server...`)
const wasmPromise = loadWasm(WASM_FILENAME, WASM_IMPORTS)
type Wasm = Awaited<typeof wasmPromise>

// call this to get the resolved wasm
let getWasm = async (): Promise<Wasm> => {
  try {
    const wasm = await wasmPromise
    console.log(`worker: wasm loaded!`)
    // change the getWasm function to simply return the resolved wasm on subsequent calls
    getWasm = async () => wasm
    return wasm
  }
  catch (err) {
    throw Error(`couldn't load wasm file "${WASM_FILENAME}"`, {cause: err})
  }
}

// precompute a log2 table since WebAssembly doesn't have a built-in log function
const log2Table: Float32Array = makeLog2Table((1 + 2 * MAX_KERNEL_RADIUS)**2)

onmessage = async ({ data: job }: MessageEvent<JobUID & Job>) => {
  try {
    const wasm = await getWasm()
    const result = performJob(job, wasm)
    postJobSuccess(job.jobUid, result.return, result.transferables)
  } catch (err) {
    postJobError(job.jobUid, Error(`while trying to perform job "${job.jobName}"`, { cause: err }))
  }
}

function postJobError(jobUid: number, error: Error) {
  const result: JobUID & JobError = {
    success: false,
    jobUid,
    error,
  }
  self.postMessage(result)
}

function postJobSuccess(jobUid: number, returnValue: any, transferables?: Transferable[]) {
  const result: JobUID & JobSuccess = {
    success: true,
    jobUid,
    return: returnValue,
  }
  if (transferables)
    self.postMessage(result, transferables)
  else
    self.postMessage(result)
}

// if job has anything to transfer back then it should return an array of transferables
function performJob(job: Job, wasm: Wasm): JobResult {
  const fn = JobDispatch[job.jobName as JOB_NAME]
  if (!fn)
    throw Error(`worker doesn't know how to do that job`)
  return fn(job, wasm)
}

// spatial_entropy_u8

function verifyJob_spatial_entropy_u8(job: Job): job is Job_spatial_entropy_u8 {
  return (
    job.jobName === 'spatial_entropy_u8' &&
    'arrayBuffer' in job.jobArgs &&
    job.jobArgs.arrayBuffer instanceof ArrayBuffer &&
    job.jobArgs.arrayBuffer.length > 0 &&
    'width' in job.jobArgs &&
    'height' in job.jobArgs
  )
}

function perform_spatial_entropy_u8(job: Job, wasm: Wasm): JobResult<JobReturn_spatial_entropy_u8> {
  if (!verifyJob_spatial_entropy_u8(job))
    throw Error(`job parameter mismatch in perform_spatial_entropy_u8()`)

  // TODO: get radius from job args
  const radius = 5

  const arrayBuffer = job.jobArgs.arrayBuffer
  const inputArray = new Uint8Array(arrayBuffer)

  let memOffset = wasm.mem.initialOffset

  const log2TableOffset = memOffset
  memOffset += log2Table.BYTES_PER_ELEMENT * log2Table.length

  const inputArrayOffset = memOffset
  memOffset += inputArray.BYTES_PER_ELEMENT * inputArray.length

  const outputArrayOffset = memOffset
  memOffset += inputArray.BYTES_PER_ELEMENT * inputArray.length

  makeWasmMemoryAtLeast(wasm.mem.memory, memOffset)

  const wasmLog2Table = new Float32Array(wasm.mem.memory.buffer, log2TableOffset, log2Table.length)
  wasmLog2Table.set(log2Table)

  const wasmInputArray = new Uint8Array(wasm.mem.memory.buffer, inputArrayOffset, inputArray.length)
  wasmInputArray.set(inputArray)

  wasm.exports.spatial_entropy_u8(
    radius,
    log2TableOffset,
    job.jobArgs.width,
    job.jobArgs.height,
    inputArrayOffset,
    outputArrayOffset,
  )

  const wasmOutputArray = new Uint8Array(wasm.mem.memory.buffer, outputArrayOffset, inputArray.length)
  inputArray.set(wasmOutputArray)

  return { return: { arrayBuffer }, transferables: [arrayBuffer] }
}