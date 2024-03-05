// 2024.03.04 Atlee Brink
// high level interface to spatial_entropy_u8

import { WorkerQueueAsync } from "./WorkerQueueAsync.js"
import { JobReturn_spatial_entropy_u8, Job_spatial_entropy_u8 } from "./spatial_entropy_u8.types.js"

export async function calculateEntropyU8(
  workerQueue: WorkerQueueAsync,
  array: Uint8Array,
  width: number,
  height: number
)
: Promise<Uint8Array>
{
  const job: Job_spatial_entropy_u8 = {
    jobName: 'spatial_entropy_u8',
    jobArgs: {
      arrayBuffer: array.buffer,
      width,
      height
    }
  }
  const result = await workerQueue.postJobAsync<JobReturn_spatial_entropy_u8>(job, [job.jobArgs.arrayBuffer])
  return new Uint8Array(result.arrayBuffer)
}
