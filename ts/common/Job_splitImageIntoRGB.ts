// 2024.03.05 Atlee Brink

import { Job } from "./Job.js"

export const JobName_splitImageIntoRGB = <const>'splitImageIntoRGB'

export interface Job_splitImageIntoRGB extends Job {
  jobName: typeof JobName_splitImageIntoRGB
  jobArgs: {
    image: ArrayBuffer // Uint32Array(numPixels)
    numPixels: number
  }
}

export interface JobReturn_splitImageIntoRGB  {
  r: ArrayBuffer //Uint8Array
  g: ArrayBuffer
  b: ArrayBuffer
}

export function verifyJob_splitImageIntoRGB(job: Job): job is Job_splitImageIntoRGB {
  return (
    job.jobName === JobName_splitImageIntoRGB &&
    'jobArgs' in job &&
    job.jobArgs.image instanceof ArrayBuffer &&
    job.jobArgs.image.byteLength > 0 &&
    'numPixels' in job.jobArgs
  )
}