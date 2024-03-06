// 2024.02.27 Atlee Brink

import { calculateEntropy } from "./calculateEntropy.js";
import { B, D, L, O, rep } from "../common/common.js"
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
    controlBox = L('div', {className: 'control-box'}),
    imageFileInput = L('input', { onchange: onchangeImageFileInput, type: 'file', accept: 'image/*', hidden: true }),
    loadButton = L('button', { onclick: () => imageFileInput.click(), innerHTML: 'Choose Image...' }, {}, imageFileInput),
    calcButton = L('button', { onclick: onclickCalcButton, innerHTML: `Calculate Entropy...`, disabled: true }),
    imageBox = L('div', {className: 'image-box'}),
    canvases = rep(2, () => L('canvas', { width: 1, height: 1 })),
    [sourceCanvas, entropyCanvas] = canvases,
    [sourceCanvasContext, entropyCanvasContext] = [sourceCanvas, entropyCanvas].map(c => c.getContext('2d') as CanvasRenderingContext2D)

  /* TODO
  
    UI layout:
      Set body (or whatever) to 100dvw, 100dvh, no scrolling. Zooming is fine.

      control panel on top: flexbox, keep contents clustered in center, wrap if necessary
        monitor height and set to a CSS var (--control-panel-height, or something)
      one image container immediately below; this displays either the source image or the entropy image
        use aspect ratio CSS var, set when image is loaded (will be same for source and entropy of course)
        use CSS to make this container as big as possible within (100dvh - control-panel-height) height and (100dvw) width
      
    Not sure if I want the whole thing to be vertically centered or just leave it aligned to the top.
  */
  
  // observe height of controlBox and set --control-box-height in CSS
  new ResizeObserver(roe => D.documentElement.style.setProperty('--control-box-height', `${roe[0].contentBoxSize[0].blockSize}px`))
    .observe(controlBox)

  controlBox.append(loadButton, calcButton)
  imageBox.append(sourceCanvas, entropyCanvas)

  B.append(controlBox, imageBox)

  function onchangeImageFileInput(e: Event) {
    const
      input = e.target as HTMLInputElement,
      file = input.files?.[0]
    if (file instanceof File)
      loadImageFromFile(file)
        .then(image => {
          setSourceImage(image)
          showCanvas(sourceCanvas)
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

  function setImageBoxAspectRatio(width: number, height: number) {
    imageBox.style.setProperty('--aspect-ratio', `${width / height}`)
  }

  function setSourceImage(image: HTMLImageElement) {
    const { width, height } = image
    O.assign(sourceCanvas, { width, height })
    sourceCanvasContext.drawImage(image, 0, 0)
    setImageBoxAspectRatio(width, height)
  }

  function showCanvas(canvas: HTMLCanvasElement) {
    canvases.forEach(c => c.hidden = c !== canvas)
  }
}