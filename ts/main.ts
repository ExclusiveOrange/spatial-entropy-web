// 2024.02.27 Atlee Brink

import { calculateEntropyU8 } from "./calculateEntropyU8.js";
import { B, L } from "./common.js"
import { joinColorChannelsIntoImage } from "./joinColorChannelsIntoImage.js";
import { loadImageFromFile } from "./loadImageFromFile.js"
import { splitImageIntoColorChannels } from "./splitImageIntoColorChannels.js";
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
    const sourceImageData = sourceCanvasContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
    calculateEntropy(sourceImageData, workerQueue)
      .then(setEntropyImage)
  }

  function setReady(ready: boolean) {
    calcButton.disabled = !ready
  }

  function setEntropyImage(imageData: ImageData) {
    const {width, height} = imageData
    Object.assign(entropyCanvas, { width, height })
    entropyCanvasContext.putImageData(imageData, 0, 0)
  }

  function setSourceImage(image: HTMLImageElement) {
    const {width, height} = image
    Object.assign(sourceCanvas, {width, height})
    sourceCanvasContext.drawImage(image, 0, 0)
  }
})()

async function calculateEntropy(sourceImage: ImageData, workerQueue: WorkerQueueAsync): Promise<ImageData> {
  const {width, height} = sourceImage
  const channels = await splitImageIntoColorChannels(sourceImage)
  const jobs = channels.map(c => calculateEntropyU8(workerQueue, c, width, height))
  const [c0, c1, c2] = await Promise.all(jobs)
  return joinColorChannelsIntoImage(width, height, c0, c1, c2)
}