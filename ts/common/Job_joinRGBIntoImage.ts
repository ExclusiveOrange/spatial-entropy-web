// 2024.03.05 Atlee Brink

import { Job } from "./Job.js"

export const JobName_joinRGBIntoImage = <const>'joinRGBIntoImage'

export interface Job_joinRGBIntoImage extends Job {
  jobName: typeof JobName_joinRGBIntoImage
  jobArgs: {
    r: ArrayBuffer // Uint8Array(numPixels)
    g: ArrayBuffer
    b: ArrayBuffer
    numPixels: number
  }
}

export interface JobReturn_joinRGBIntoImage {
  image: ArrayBuffer // Uint32Array
}

export function verifyJob_joinRGBIntoImage(job: Job): job is Job_joinRGBIntoImage {
  return (
    job.jobName === JobName_joinRGBIntoImage &&
    'jobArgs' in job &&
    isNonEmptyArrayBuffer(job.jobArgs.r) &&
    isNonEmptyArrayBuffer(job.jobArgs.g) &&
    isNonEmptyArrayBuffer(job.jobArgs.b) &&
    'numPixels' in job.jobArgs
  )

  function isNonEmptyArrayBuffer(x: any): x is ArrayBuffer {
    return x instanceof ArrayBuffer && x.byteLength > 0
  }
}