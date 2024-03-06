// 2024.02.27 Atlee Brink

import { calculateEntropy } from "./calculateEntropy.js";
import { B, L, O, rep } from "../common/common.js"
import { loadImageFromFile } from "./loadImageFromFile.js"
import { WorkerQueueAsync } from "./WorkerQueueAsync.js"

try {
  main()
}
catch (err) {
  console.error(`Uncaught error in main:`, err, err instanceof Error ? err.cause ?? '' : '')
}

function main() {
  const
    worker = new Worker('worker.js', { credentials: 'include' }),
    workerQueue = new WorkerQueueAsync(worker),
    imageFileInput = L('input', { onchange: onchangeImageFileInput, type: 'file', accept: 'image/*', hidden: true }),
    loadButton = L('button', { onclick: () => imageFileInput.click(), innerHTML: 'Choose Image...' }, {}, imageFileInput),
    calcButton = L('button', { onclick: onclickCalcButton, innerHTML: `Calculate Entropy...`, disabled: true }),
    [sourceCanvas, entropyCanvas] = rep(2, () => L('canvas', { width: 1, height: 1 })),
    [sourceCanvasContext, entropyCanvasContext] = [sourceCanvas, entropyCanvas].map(c => c.getContext('2d') as CanvasRenderingContext2D)

  B.append(loadButton, calcButton, sourceCanvas, entropyCanvas)

  function onchangeImageFileInput(e: Event) {
    const
      input = e.target as HTMLInputElement,
      file = input.files?.[0]
    if (file instanceof File)
      loadImageFromFile(file)
        .then(image => {
          setSourceImage(image)
          setReady(true)
        })
        .catch(err => console.error(`error loading image:`, err, err.cause ?? ''))
  }

  function onclickCalcButton() {
    const sourceImageData = sourceCanvasContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
    calculateEntropy(sourceImageData, workerQueue)
      .then(setEntropyImage)
  }

  function setEntropyImage(imageData: ImageData) {
    const { width, height } = imageData
    O.assign(entropyCanvas, { width, height })
    entropyCanvasContext.putImageData(imageData, 0, 0)
  }

  function setReady(ready: boolean) {
    calcButton.disabled = !ready
  }

  function setSourceImage(image: HTMLImageElement) {
    const { width, height } = image
    O.assign(sourceCanvas, { width, height })
    sourceCanvasContext.drawImage(image, 0, 0)
  }
}