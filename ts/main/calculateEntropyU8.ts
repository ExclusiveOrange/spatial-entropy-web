// 2024.03.04 Atlee Brink

import { JobName_calculateEntropyU8, JobReturn_calculateEntropyU8, Job_calculateEntropyU8 } from "../common/Job_calculateEntropyU8.js"
import { IWorkerQueue } from "./IWorkerQueue.js"

export async function calculateEntropyU8(
  workerQueue: IWorkerQueue,
  array: Uint8Array,
  width: number,
  height: number,
  kernelRadius: number
)
: Promise<Uint8Array>
{
  const
    job: Job_calculateEntropyU8 = <const>{
      jobName: JobName_calculateEntropyU8,
      jobArgs: {
        arrayBuffer: array.buffer,
        width,
        height,
        kernelRadius,
      }
    },
    result = await workerQueue.postJobAsync<JobReturn_calculateEntropyU8>(job, [job.jobArgs.arrayBuffer])
  return new Uint8Array(result.arrayBuffer)
}
