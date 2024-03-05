// 2024.03.04 Atlee Brink

import { calculateEntropyU8 } from "./calculateEntropyU8.js"
import { joinColorChannelsIntoImage } from "./joinColorChannelsIntoImage.js"
import { splitImageIntoRGB } from "./splitImageIntoRGB.js"
import { WorkerQueueAsync } from "./WorkerQueueAsync.js"

export async function calculateEntropy(sourceImage: ImageData, workerQueue: WorkerQueueAsync): Promise<ImageData> {
  const {width, height} = sourceImage
  const channels = await splitImageIntoRGB(workerQueue, new Uint32Array(sourceImage.data.buffer), width * height)
  const jobs = channels.map(c => calculateEntropyU8(workerQueue, c, width, height))
  const [c0, c1, c2] = await Promise.all(jobs)
  return joinColorChannelsIntoImage(width, height, c0, c1, c2)
}
