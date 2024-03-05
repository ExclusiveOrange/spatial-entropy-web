// 2024.03.05 Atlee Brink

import { JobName_splitImageIntoRGB, JobReturn_splitImageIntoRGB, Job_splitImageIntoRGB } from "../common/Job_splitImageIntoRGB.js";
import { WorkerQueueAsync } from "./WorkerQueueAsync.js";

export async function splitImageIntoRGB(
  workerQueue: WorkerQueueAsync,
  image: ImageData
)
: Promise<[Uint8Array, Uint8Array, Uint8Array]>
{
  const job: Job_splitImageIntoRGB = <const>{
    jobName: JobName_splitImageIntoRGB,
    jobArgs: {
      image: image.data.buffer,
      numPixels: image.width * image.height
    }
  }
  const result = await workerQueue.postJobAsync<JobReturn_splitImageIntoRGB>(job, [job.jobArgs.image])
  return [
    new Uint8Array(result.r),
    new Uint8Array(result.g),
    new Uint8Array(result.b),
  ]
}