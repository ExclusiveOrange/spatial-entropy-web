// 2024.02.29 Atlee Brink

import { MAX_KERNEL_RADIUS } from "./limits.js";
import { makeLog2Table } from "./makeLog2Table.js";
import { loadWasm } from "./wasm.js";
import { Job, JobError, JobSuccess, JobUID } from "./WorkerJob.js";

// WASM function signatures
import { spatial_entropy_u8 } from "../c/spatial_entropy_u8.js";

const WASM_FILENAME = "wasm.wasm"
const WASM_IMPORTS = <const>{
  spatial_entropy_u8,
}
type JOB_NAME = keyof typeof WASM_IMPORTS

type JobResult = { return: any, transferables?: Transferable[] }

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

function perform_spatial_entropy_u8(job: Job): JobResult {
  // TODO
  return { return: 100 }
}