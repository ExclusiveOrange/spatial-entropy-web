// 2024.02.27 Atlee Brink

import { calculateEntropy } from "./calculateEntropy.js";
import { B, D, L, O, rep } from "../common/common.js"
import { loadImageFromFile } from "./loadImageFromFile.js"
import { WorkerQueueAsync } from "./WorkerQueueAsync.js"
import { MAX_KERNEL_RADIUS } from "../common/limits.js";

try {
  main()
}
catch (err) {
  console.error(`Uncaught error in main:`, err, err instanceof Error ? err.cause ?? '' : '')
}

function main() {
  const
    toggleKey = ' ', // Space
    initialKernelRadius = 5 // TODO: set and get in browser storage

  const
    worker = new Worker('worker.js', { credentials: 'include' }),
    workerQueue = new WorkerQueueAsync(worker),
    controlBox = L('div', { className: 'control-box' }),
    imageFileInput = L('input', { type: 'file', accept: 'image/*', onchange: onchangeImageFileInput, hidden: true }),
    loadButton = L('button', { onclick: () => imageFileInput.click(), innerHTML: 'Choose Image...' }, {}, imageFileInput),
    radiusNumberInput = L('input', { type: 'number', min: '1', max: `${MAX_KERNEL_RADIUS}`, step: '1', valueAsNumber: initialKernelRadius, oninput: oninputRadius, onkeydown: onkeydownRadiusNumberInput }),
    radiusSliderInput = L('input', { type: 'range', min: '1', max: `${MAX_KERNEL_RADIUS}`, step: '1', valueAsNumber: initialKernelRadius, oninput: oninputRadius }),
    radiusInputs = [radiusNumberInput, radiusSliderInput],
    radiusSliderLabel = L('label', { innerHTML: `kernel radius:` }),
    calcButton = L('button', { innerHTML: `Calculate Entropy...`, onclick: onclickCalcButton }),
    toggleButton = L('button', { innerHTML: `Toggle Image`, onclick: onclickToggleButton }),
    imageBox = L('div', { className: 'image-box' }),
    canvases = rep(2, () => L('canvas', { width: 1, height: 1 })),
    [sourceCanvas, entropyCanvas] = canvases,
    [sourceCanvasContext, entropyCanvasContext] = [sourceCanvas, entropyCanvas].map(c => c.getContext('2d') as CanvasRenderingContext2D)

  // observe height of controlBox and set --control-box-height in CSS,
  // this is so other elements (imageBox) can calculate their own maximum height
  new ResizeObserver(roe => D.documentElement.style.setProperty('--control-box-height', `${roe[0].borderBoxSize[0].blockSize}px`))
    .observe(controlBox)

  radiusSliderLabel.append(radiusSliderInput, radiusNumberInput)
  controlBox.append(loadButton, radiusSliderLabel, calcButton, toggleButton)
  imageBox.append(sourceCanvas, entropyCanvas)
  B.append(controlBox, imageBox)

  disableEntropyControls()

  D.addEventListener('keydown', e => D.activeElement === B && onkeydownBody(e))

  function disableAllControls(disable = true) {
    enableAllControls(!disable)
  }

  function disableEntropyControls(disable = true) {
    enableEntropyControls(!disable)
  }

  function enableAllControls(enable = true) {
    [loadButton, ...radiusInputs, calcButton, toggleButton].forEach(i => i.disabled = !enable)
  }

  function enableEntropyControls(enable = true) {
    [...radiusInputs, calcButton, toggleButton].forEach(i => i.disabled = !enable)
  }

  function getKernelRadius() {
    return radiusSliderInput.valueAsNumber
  }

  function onchangeImageFileInput(e: Event) {
    const
      input = e.target as HTMLInputElement,
      file = input.files?.[0]
    if (file instanceof File)
      loadImageFromFile(file)
        .then(image => {
          setSourceImage(image)
          showCanvas(sourceCanvas)
          enableEntropyControls()
        })
        .catch(err => console.error(`error loading image:`, err, err.cause ?? ''))
  }

  function onclickCalcButton() {
    disableAllControls()
    const sourceImageData = sourceCanvasContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
    calculateEntropy(workerQueue, sourceImageData, getKernelRadius())
      .then(image => {
        setEntropyImage(image)
        enableAllControls()
      })
  }

  function onclickToggleButton() {
    entropyCanvas.hidden = sourceCanvas.hidden
    sourceCanvas.hidden = !sourceCanvas.hidden
  }

  function oninputRadius(e: Event) {
    const
      input = e.target as HTMLInputElement,
      rawNewValue = input.valueAsNumber,
      newValue = Math.max(1, Math.min(rawNewValue, MAX_KERNEL_RADIUS))
    radiusInputs.forEach(i => i !== input && (i.valueAsNumber = newValue))
    if (rawNewValue !== newValue)
      input.valueAsNumber = newValue
  }
  
  function onkeydownBody(e: KeyboardEvent) {
    if (!e.repeat)
      if (e.key === toggleKey)
        toggleButton.click()
  }

  function onkeydownRadiusNumberInput(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      calcButton.click()
      e.preventDefault()
    }
  }

  function setEntropyImage(imageData: ImageData) {
    const { width, height } = imageData
    O.assign(entropyCanvas, { width, height })
    entropyCanvasContext.putImageData(imageData, 0, 0)
    showCanvas(entropyCanvas)
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