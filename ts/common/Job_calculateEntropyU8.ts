// 2024.03.04 Atlee Brink

import { Job } from "./Job.js"

export const JobName_calculateEntropyU8 = <const>'calculateEntropyU8'

export interface Job_calculateEntropyU8 extends Job {
  jobName: typeof JobName_calculateEntropyU8
  jobArgs: {
    arrayBuffer: ArrayBuffer // should also be put in the Transferable[] when posting message to worker
    width: number
    height: number
    kernelRadius: number
  }
}

export interface JobReturn_calculateEntropyU8 {
  arrayBuffer: ArrayBuffer // should also be put in the Transferable[] when posting message to main
}

export function verifyJob_calculateEntropyU8(job: Job): job is Job_calculateEntropyU8 {
  return (
    job.jobName === JobName_calculateEntropyU8 &&
    'jobArgs' in job &&
    'arrayBuffer' in job.jobArgs &&
    job.jobArgs.arrayBuffer instanceof ArrayBuffer &&
    job.jobArgs.arrayBuffer.byteLength > 0 &&
    'width' in job.jobArgs &&
    'height' in job.jobArgs &&
    'kernelRadius' in job.jobArgs
  )
}