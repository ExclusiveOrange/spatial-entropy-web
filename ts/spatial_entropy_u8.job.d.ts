// 2024.03.04 Atlee Brink

import { Job, JobSuccess } from "./WorkerJob.js"

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