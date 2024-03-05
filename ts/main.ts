// 2024.02.27 Atlee Brink

import {B, I, L} from "./common.js"
import { loadImageFromFile } from "./loadImageFromFile.js"
import { JobReturn_spatial_entropy_u8, Job_spatial_entropy_u8 } from "./WorkerJobs.js"
import { WorkerQueueAsync } from "./WorkerQueueAsync.js"

;(() => {
  const worker = new Worker('worker.js', {credentials: 'include'})
  const workerQueue = new WorkerQueueAsync(worker)

  // The Choose Image... button.
  // Note: the built-in appearance of the <input> is pretty bad, so I hide it in a <button>
  const imageFileInput = L('input', {type: 'file', accept: 'image/*', hidden: true})
  const loadButton = L('button', {innerHTML: 'Choose Image...'}, {}, imageFileInput)
  loadButton.onclick = e => imageFileInput.click()
  imageFileInput.onchange = () => {
    if (imageFileInput.files?.[0] instanceof Blob)
      loadImageFromFile(imageFileInput.files[0])
        .then(image => {
          setSourceImage(image)
          setReady(true)
        })
        .catch(err => console.error(`error loading image:`, err, err.cause ?? ''))
  }

  const calcButton = L('button', { onclick: onclickCalcButton, innerHTML: `Calculate Entropy...`, disabled: true })

  const sourceCanvas = L('canvas', { width: 1, height: 1 })
  const sourceCanvasContext = sourceCanvas.getContext('2d') as CanvasRenderingContext2D
  const entropyCanvas = L('canvas', { width: 1, height: 1 })
  const entropyCanvasContext = entropyCanvas.getContext('2d') as CanvasRenderingContext2D

  B.append(loadButton, calcButton, sourceCanvas, entropyCanvas)

  function onclickCalcButton() {
    const {width, height} = sourceCanvas
    calculateEntropy(sourceCanvasContext.getImageData(0, 0, width, height), workerQueue)
    .then(entropy => {
      console.log('entropy:', entropy)
      Object.assign(entropyCanvas, {width, height})
      entropyCanvasContext.putImageData(entropy, 0, 0)
    })
  }

  function setReady(ready: boolean) {
    calcButton.disabled = !ready
  }

  function setSourceImage(image: HTMLImageElement) {
    sourceCanvas.width = image.width
    sourceCanvas.height = image.height
    sourceCanvasContext.drawImage(image, 0, 0)
  }
})()

async function calculateEntropy(sourceImage: ImageData, workerQueue: WorkerQueueAsync): Promise<ImageData> {
  const {width, height} = sourceImage

  // TODO: splitting could be done on a webworker
  const jobs = splitImageIntoColorChannels(sourceImage).map(channel => {
    const job: Job_spatial_entropy_u8 = {
      jobName: 'spatial_entropy_u8',
      jobArgs: {
        arrayBuffer: channel.buffer,
        width,
        height
      }
    }
    return workerQueue.postJobAsync<JobReturn_spatial_entropy_u8>(job, [job.jobArgs.arrayBuffer])
  })

  const channels = await Promise.all(jobs)
  const [c0, c1, c2] = channels.map(c => new Uint8Array(c.arrayBuffer))

  // TODO: joining could be done on a webworker
  return joinColorChannelsIntoImage(width, height, c0, c1, c2)
}

function joinColorChannelsIntoImage(width: number, height: number, c0: Uint8Array, c1: Uint8Array, c2: Uint8Array): ImageData {
  const image = new ImageData(width, height)
  const imageAsU32Array = new Uint32Array(image.data.buffer)
  const numPixels = width * height

  for (let i = 0; i < numPixels; ++i)
    imageAsU32Array[i] = 0xff000000 |
      c0[i] |
      c1[i] << 8 |
      c2[i] << 16;

  return image
}

function splitImageIntoColorChannels(image: ImageData): [Uint8Array, Uint8Array, Uint8Array] {
  const {width, height} = image
  const numPixels = width * height
  const imageAsU32Array = new Uint32Array(image.data.buffer)

  const c0 = new Uint8Array(numPixels)
  const c1 = new Uint8Array(numPixels)
  const c2 = new Uint8Array(numPixels)

  for (let i = 0; i < numPixels; ++i) {
    const pixel = imageAsU32Array[i]
    c0[i] = pixel & 0xff
    c1[i] = pixel >> 8 & 0xff
    c2[i] = pixel >> 16 & 0xff
  }

  return [c0, c1, c2]
}