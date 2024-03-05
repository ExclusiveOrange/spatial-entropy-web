// 2024.03.04 Atlee Brink

import { calculateEntropyU8 } from "./calculateEntropyU8.js"
import { joinColorChannelsIntoImage } from "./joinColorChannelsIntoImage.js"
import { splitImageIntoColorChannels } from "./splitImageIntoColorChannels.js"
import { WorkerQueueAsync } from "./WorkerQueueAsync.js"

export async function calculateEntropy(sourceImage: ImageData, workerQueue: WorkerQueueAsync): Promise<ImageData> {
  const {width, height} = sourceImage
  const channels = await splitImageIntoColorChannels(sourceImage)
  const jobs = channels.map(c => calculateEntropyU8(workerQueue, c, width, height))
  const [c0, c1, c2] = await Promise.all(jobs)
  return joinColorChannelsIntoImage(width, height, c0, c1, c2)
}
