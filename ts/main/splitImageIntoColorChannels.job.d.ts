// 2024.03.05 Atlee Brink

import { Job } from "../common/Job.js"

export interface Job_splitImageIntoColorChannels extends Job {
  jobName: 'splitImageIntoColorChannels'
  jobArgs: {
    arrayBuffer: ArrayBuffer // Uint32Array(numPixels)
    numPixels: number
  }
}

export interface JobReturn_splitImageIntoColorChannels  {
  r: ArrayBuffer //Uint8Array
  g: ArrayBuffer
  b: ArrayBuffer
}