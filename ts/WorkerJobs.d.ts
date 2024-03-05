// 2024.03.03 Atlee Brink

import { Job, JobError, JobSuccess } from "./WorkerJob.js";

export type JobResult<ReturnType = any> = { return: ReturnType, transferables?: Transferable[] }

export interface Job_spatial_entropy_u8 extends Job {
  jobName: 'spatial_entropy_u8'
  jobArgs: {
    arrayBuffer: ArrayBuffer // should also be put in the Transferable[] when posting message to worker
    width: number
    height: number
  }
}

export interface JobReturn_spatial_entropy_u8 {
  arrayBuffer: ArrayBuffer // should also be put in the Transferable[] when posting message to main
}

export type JobSuccess_spatial_entropy_u8 = JobSuccess & JobReturn_spatial_entropy_u8

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
