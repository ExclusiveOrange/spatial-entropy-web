// 2024.03.05 Atlee Brink

import { JobName_splitImageIntoRGB, JobReturn_splitImageIntoRGB, Job_splitImageIntoRGB } from "../common/Job_splitImageIntoRGB.js";
import { WorkerQueueAsync } from "./WorkerQueueAsync.js";

export async function splitImageIntoRGB(
  workerQueue: WorkerQueueAsync,
  array: Uint32Array,
  numPixels: number
)
: Promise<[Uint8Array, Uint8Array, Uint8Array]>
{
  const job: Job_splitImageIntoRGB = <const>{
    jobName: JobName_splitImageIntoRGB,
    jobArgs: {
      arrayBuffer: array.buffer,
      numPixels
    }
  }
  const result = await workerQueue.postJobAsync<JobReturn_splitImageIntoRGB>(job, [job.jobArgs.arrayBuffer])
  return [
    new Uint8Array(result.r),
    new Uint8Array(result.g),
    new Uint8Array(result.b),
  ]
}