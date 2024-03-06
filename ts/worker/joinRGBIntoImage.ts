// 2024.03.04 Atlee Brink

import { Job, JobResult } from "../common/Job.js";

import { JobName_joinRGBIntoImage, JobReturn_joinRGBIntoImage, verifyJob_joinRGBIntoImage } from "../common/Job_joinRGBIntoImage.js"

export const JOB_DISPATCH = <const>{
  [JobName_joinRGBIntoImage]: joinRGBIntoImage
}

function joinRGBIntoImage(job: Job): JobResult<JobReturn_joinRGBIntoImage> {
  if (!verifyJob_joinRGBIntoImage(job))
    throw Error(`job parameter mismatch in ${JobName_joinRGBIntoImage}`)

  const
    numPixels = job.jobArgs.numPixels,
    image = new Uint32Array(numPixels),
    r = new Uint8Array(job.jobArgs.r),
    g = new Uint8Array(job.jobArgs.g),
    b = new Uint8Array(job.jobArgs.b)

  for (let i = 0; i < numPixels; ++i)
    image[i] = 0xff000000 |
      r[i] |
      g[i] << 8 |
      b[i] << 16;

  return {
    return: { image: image.buffer },
    transferables: [image.buffer]
  }
}
