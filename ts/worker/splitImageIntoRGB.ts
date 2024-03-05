// 2024.03.04 Atlee Brink

import { Job, JobResult } from "../common/Job.js"
import { JobName_splitImageIntoRGB, JobReturn_splitImageIntoRGB, verifyJob_splitImageIntoRGB } from "../common/Job_splitImageIntoRGB.js"

export const JOB_DISPATCH = <const>{
  [JobName_splitImageIntoRGB]: splitImageIntoRGB
}

function splitImageIntoRGB(job: Job): JobResult<JobReturn_splitImageIntoRGB> {
  if (!verifyJob_splitImageIntoRGB(job))
    throw Error(`job parameter mismatch in ${JobName_splitImageIntoRGB}`)

  const numPixels = job.jobArgs.numPixels
  const imageAsU32Array = new Uint32Array(job.jobArgs.image)

  const c0 = new Uint8Array(numPixels)
  const c1 = new Uint8Array(numPixels)
  const c2 = new Uint8Array(numPixels)

  for (let i = 0; i < numPixels; ++i) {
    const pixel = imageAsU32Array[i]
    c0[i] = pixel & 0xff
    c1[i] = pixel >> 8 & 0xff
    c2[i] = pixel >> 16 & 0xff
  }

  const r = c0.buffer
  const g = c1.buffer
  const b = c2.buffer

  return {
    return: { r, g, b },
    transferables: [r, g, b]
  }
}
