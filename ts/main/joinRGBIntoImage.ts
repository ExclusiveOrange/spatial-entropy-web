// 2024.03.05 Atlee Brink

import { JobName_joinRGBIntoImage, JobReturn_joinRGBIntoImage, Job_joinRGBIntoImage } from "../common/Job_joinRGBIntoImage.js";
import { WorkerQueueAsync } from "./WorkerQueueAsync.js";

export async function joinRGBIntoImage(
  workerQueue: WorkerQueueAsync,
  r: Uint8Array,
  g: Uint8Array,
  b: Uint8Array,
  width: number,
  height: number,
)
: Promise<ImageData>
{
  const
    job: Job_joinRGBIntoImage = <const>{
      jobName: JobName_joinRGBIntoImage,
      jobArgs: {
        r: r.buffer,
        g: g.buffer,
        b: b.buffer,
        numPixels: width * height
      }
    },
    result = await workerQueue.postJobAsync<JobReturn_joinRGBIntoImage>(job, [r.buffer, g.buffer, b.buffer])
  return new ImageData(new Uint8ClampedArray(result.image), width, height)
}