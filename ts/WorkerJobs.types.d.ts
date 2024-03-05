// 2024.03.03 Atlee Brink

import { Job, JobError, JobSuccess } from "./WorkerJob.types.js";

export { Job_spatial_entropy_u8, JobReturn_spatial_entropy_u8 } from "./spatial_entropy_u8.types.js";

export type JobResult<ReturnType = any> = { return: ReturnType, transferables?: Transferable[] }

// TODO: move
export interface Job_splitColorChannels extends Job {
  jobName: 'splitColorChannels'
  jobArgs: {
    arrayBuffer: ArrayBuffer // rgba, numpixels is bytelength / 4
  }
}
export interface JobReturn_splitColorChannels {
  r: ArrayBuffer // uint8, numpixels is bytelength
  g: ArrayBuffer
  b: ArrayBuffer
}
