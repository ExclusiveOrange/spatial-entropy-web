// 2024.02.29 Atlee Brink

import { loadWasm } from "./wasm.js";
import { Wasm, WasmMemory } from "./wasm.types.js";
import { Job, JobError, JobSuccess, JobUID } from "./WorkerJob.types.js";

import * as spatial_entropy_u8 from "./spatial_entropy_u8.js";

const WASM_URL = "wasm.wasm"

// specify the wasm function signatures that should be imported with loadWasm
const WASM_IMPORTS = <const>{
  ...spatial_entropy_u8.WASM_IMPORTS
}

type WasmImports = typeof WASM_IMPORTS
type JobName = keyof WasmImports
type JobResult<ReturnType = any> = { return: ReturnType, transferables?: Transferable[] }

// maps job name to function
const JOB_DISPATCH: {[name in JobName]: (job: Job, wasmMemory: WasmMemory, wasmImports: WasmImports) => JobResult} = <const>{
  ...spatial_entropy_u8.JOB_DISPATCH
}

// start loading (fetching) the WebAssembly file immediately
console.log(`worker: loading wasm from server...`)
const wasmPromise = loadWasm(WASM_URL, WASM_IMPORTS).then(wasm => (console.log(`worker: wasm loaded!`), wasm))

// call this to get the resolved wasm
let getWasm = async (): Promise<Wasm<WasmImports>> => {
  try {
    const wasm = await wasmPromise
    getWasm = async () => wasm
    return wasm
  }
  catch (err) {
    throw Error(`couldn't load wasm file "${WASM_URL}"`, {cause: err})
  }
}

self.onmessage = async ({ data: job }: MessageEvent<JobUID & Job>) => {
  try {
    const wasm = await getWasm()
    const result = performJob(job, wasm.memory, wasm.imports)
    postJobSuccess(job.jobUid, result.return, result.transferables)
  } catch (err) {
    postJobError(job.jobUid, Error(`while trying to perform job "${job.jobName}"`, { cause: err }))
  }
}

// if job has anything to transfer back then it should return an array of transferables
function performJob(job: Job, wasmMemory: WasmMemory, wasmImports: WasmImports): JobResult {
  const fn = JOB_DISPATCH[job.jobName as JobName]
  if (!fn)
    throw Error(`worker doesn't know how to do that job`)
  return fn(job, wasmMemory, wasmImports)
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