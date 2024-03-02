// 2024.02.29 Atlee Brink

import { MAX_KERNEL_RADIUS } from "./limits.js";
import { makeLog2Table } from "./makeLog2Table.js";
import { loadWasm } from "./wasm.js";
import { Job, JobUID } from "./WorkerTask.js";

// WASM function signatures
import { spatial_entropy_u8 } from "../c/spatial_entropy_u8.js";

const WASM_FILENAME = "wasm.wasm"
const WASM_IMPORTS = <const>{
  spatial_entropy_u8,
}
type JOB_NAME = keyof typeof WASM_IMPORTS

type JobFailure = { success: false, err: Error }
type JobSuccess = { success: true, return: any, transferables?: Transferable[] }
type JobResult = JobFailure | JobSuccess

const JobDispatch: {[name in JOB_NAME]: (job: Job) => JobResult} = <const>{
  spatial_entropy_u8: perform_spatial_entropy_u8,
}

// start loading (fetching) the WebAssembly file immediately
console.log(`worker: loading wasm from server...`)
const wasmPromise = loadWasm(WASM_FILENAME, WASM_IMPORTS)
let wasm: Awaited<typeof wasmPromise> | null = null

// precompute a log2 table since WebAssembly doesn't have a built-in log function
const log2Table: Float32Array = makeLog2Table((1 + 2 * MAX_KERNEL_RADIUS)**2)

onmessage = async ({ data: job }: MessageEvent<JobUID & Job>) => {

  // make sure wasm has finished loading
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

  // perform the job or fail
  const result = performJob(job)

  // post a reply
  if (result.success)
    self.postMessage({
      jobUid: job.jobUid,
      return: result.return,
    },
      result.transferables!
    )
  else
    self.postMessage({
      jobUid: job.jobUid,
      err: result.err
    })
}

// if job has anything to transfer back then it should return an array of transferables
function performJob(job: Job): JobResult {
  try {
    const fn = JobDispatch[job.jobName as JOB_NAME]
    if (!fn)
      throw Error(`worker doesn't know how to do job "${job.jobName}"`)
    return fn(job)
  }
  catch (err) {
    if (err instanceof Error)
      return { success: false, err }
    return { success: false, err: Error(`caught "${err}" while performing job "${job.jobName}"`) }
  }
}

function perform_spatial_entropy_u8(job: Job): JobResult {
  // TODO
  return { success: true, return: 100 }
}