// 2024.03.04 Atlee Brink

import { Job } from "./Job.js"

export const JobName_calculateEntropyU8 = <const>'calculateEntropyU8'

export interface Job_calculateEntropyU8 extends Job {
  jobName: typeof JobName_calculateEntropyU8
  jobArgs: {
    arrayBuffer: ArrayBuffer // should also be put in the Transferable[] when posting message to worker
    width: number
    height: number
  }
}

export interface JobReturn_calculateEntropyU8 {
  arrayBuffer: ArrayBuffer // should also be put in the Transferable[] when posting message to main
}