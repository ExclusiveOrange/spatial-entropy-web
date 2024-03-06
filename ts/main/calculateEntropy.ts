// 2024.03.04 Atlee Brink

import { calculateEntropyU8 } from "./calculateEntropyU8.js"
import { joinRGBIntoImage } from "./joinRGBIntoImage.js"
import { splitImageIntoRGB } from "./splitImageIntoRGB.js"
import { WorkerQueueAsync } from "./WorkerQueueAsync.js"

export async function calculateEntropy(workerQueue: WorkerQueueAsync, sourceImage: ImageData, kernelRadius: number): Promise<ImageData> {
  const
    {width, height} = sourceImage,
    channels = await splitImageIntoRGB(workerQueue, sourceImage),
    jobs = channels.map(c => calculateEntropyU8(workerQueue, c, width, height, kernelRadius)),
    [r, g, b] = await Promise.all(jobs)
  return joinRGBIntoImage(workerQueue, r, g, b, width, height) 
}
