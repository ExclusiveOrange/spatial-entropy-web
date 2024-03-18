// 2024.03.04 Atlee Brink

import { IWorkerQueue } from "./IWorkerQueue.js"
import { calculateEntropyU8 } from "./calculateEntropyU8.js"
import { joinRGBIntoImage } from "./joinRGBIntoImage.js"
import { splitImageIntoRGB } from "./splitImageIntoRGB.js"

export async function calculateEntropy(workerQueue: IWorkerQueue, sourceImage: ImageData, kernelRadius: number): Promise<ImageData> {
  const
    startTime = performance.now(),
    {width, height} = sourceImage,
    channels = await splitImageIntoRGB(workerQueue, sourceImage),
    jobs = channels.map(c => calculateEntropyU8(workerQueue, c, width, height, kernelRadius)),
    [r, g, b] = await Promise.all(jobs)
  return joinRGBIntoImage(workerQueue, r, g, b, width, height).finally(() => console.log(`elapsed: ${((performance.now() - startTime) / 1000).toFixed(3)} sec`))
}
