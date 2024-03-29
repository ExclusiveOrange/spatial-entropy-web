// 2024.02.27 Atlee Brink

import { calculateEntropy } from "./calculateEntropy.js";
import { B, D, L } from "../common/common.js"
import { loadImageFromFile } from "./loadImageFromFile.js"
import { MAX_KERNEL_RADIUS } from "../common/limits.js";
import { sanitizeInteger } from "../common/sanitize.js";
import { MultiWorkers } from "./MultiWorkers.js";
import { downloadCanvasImage } from "./downloadCanvasImage.js";

try {
  main()
}
catch (err) {
  console.error(`Uncaught error in main:`, err, err instanceof Error ? err.cause ?? '' : '')
}

function main() {
  const enum State {
    init = 1,
    busy = 2,
    haveSource = 4,
    haveEntropy = 8,
    all = 0xffffffff
  }

  const
    stateKey = Symbol(),
    storageKeyBase = 'spatial-entropy',
    toggleKey = ' ', // Space
    kernelRadiusKey = 'kernel-radius',
    initialKernelRadius = sanitizeInteger(getSettingFromStorage(kernelRadiusKey), 1, MAX_KERNEL_RADIUS, MAX_KERNEL_RADIUS),
    workers = new MultiWorkers(3, 'worker.js', { credentials: 'include' }), // 3 because r, g, b
    pageHeader = L('div', { className: 'page-header' }),
    controlBox = L('div', { className: 'control-box' }),
    imageFileInput = L('input', { type: 'file', accept: 'image/*', onchange: onchangeImageFileInput, hidden: true }),
    loadButton = L('button', { [stateKey]: State.all ^ State.busy, onclick: () => imageFileInput.click(), innerHTML: 'Choose Image...' }, {}, imageFileInput),
    radiusNumberInput = L('input', { [stateKey]: State.haveSource, type: 'number', min: '1', max: `${MAX_KERNEL_RADIUS}`, step: '1', valueAsNumber: initialKernelRadius, oninput: oninputRadius, onkeydown: onkeydownRadiusNumberInput }),
    radiusSliderInput = L('input', { [stateKey]: State.haveSource, type: 'range', min: '1', max: `${MAX_KERNEL_RADIUS}`, step: '1', valueAsNumber: initialKernelRadius, oninput: oninputRadius }),
    radiusSliderLabel = L('label', { innerHTML: `kernel radius:` }),
    calcButton = L('button', { [stateKey]: State.haveSource, innerHTML: `Calculate Entropy...`, onclick: onclickCalcButton }),
    toggleButton = L('button', { [stateKey]: State.haveEntropy, innerHTML: `Toggle Image`, onclick: onclickToggleButton }),
    saveButton = L('button', { [stateKey]: State.haveEntropy, innerHTML: 'Save Entropy Image', onclick: onclickSaveButton }),
    allControls = [loadButton, radiusSliderInput, radiusNumberInput, calcButton, toggleButton, saveButton],
    imageBox = L('div', { className: 'image-box' }),
    canvases = [1, 2].map(() => L('canvas', { width: 1, height: 1 })),
    [sourceCanvas, entropyCanvas] = canvases,
    [sourceCanvasContext, entropyCanvasContext] = [sourceCanvas, entropyCanvas].map(c => c.getContext('2d') as CanvasRenderingContext2D),
    busyIndicator = L('div', { className: 'busy-indicator' }, { opacity: '0' }),
    gitHubLogo = L('img', { alt: "link to the GitHub repo for this web page", src: "./github-mark_60x60.webp" }, { aspectRatio: '60 / 60' }),
    gitHubLink = L('a', { className: 'gitHub-link', href: "https://github.com/ExclusiveOrange/spatial-entropy-web" }, { lineHeight: '0' }, gitHubLogo),
    dummyGitHubLinkForBalance = L('div', {className: 'dummy-gitHub-link'})

  let
    sourceFileName = '',
    state = State.init,
    calcedKernelRadius = initialKernelRadius

  // The following observers help me cope with the limitations of CSS or of my understanding of CSS.

  // observe height of controlBox and set --control-box-height in CSS,
  // this is so other elements (imageBox) can calculate their own maximum height
  new ResizeObserver(roe => {
    const
      borderBoxHeight = roe[0].borderBoxSize[0].blockSize,
      contentBoxHeight = roe[0].contentBoxSize[0].blockSize
    B.style.setProperty('--control-box-height', `${borderBoxHeight}px`)
    B.style.setProperty('--control-box-vpadding', `${borderBoxHeight - contentBoxHeight}px`)
  })
    .observe(controlBox)

  // observe height of a button (doesn't matter which) and set height of gitHubLogo to match
  new ResizeObserver(roe => gitHubLogo.style.setProperty('height', `calc(var(--control-box-vpadding) + ${roe[0].borderBoxSize[0].blockSize}px)`))
    .observe(loadButton)
  
  // observe width of gitHubLink and set max-width of dummyGitHubLink
  new ResizeObserver(roe => dummyGitHubLinkForBalance.style.setProperty('max-width', `${roe[0].borderBoxSize[0].inlineSize}px`))
    .observe(gitHubLink)

  radiusSliderLabel.append(radiusSliderInput, radiusNumberInput)
  controlBox.append(loadButton, radiusSliderLabel, calcButton, toggleButton, saveButton, gitHubLink)
  pageHeader.append(dummyGitHubLinkForBalance, controlBox, gitHubLink)
  imageBox.append(sourceCanvas, entropyCanvas)
  B.append(pageHeader, imageBox, busyIndicator)

  D.addEventListener('keydown', e => D.activeElement === B && onkeydownBody(e))

  setControlsForState(state)

  async function busy<T>(promise: Promise<T>): Promise<T> {
    setControlsForState(State.busy)
    busyIndicator.style.opacity = '1'
    return await promise.finally(() => {
      setControlsForState(state)
      busyIndicator.style.opacity = '0'
    })
  }

  function getKernelRadius() {
    return radiusSliderInput.valueAsNumber
  }

  function getSettingFromStorage(key: string): any {
    return localStorage.getItem(makeFullStorageKey(key))
  }

  function makeFullStorageKey(key: string): string {
    return `${storageKeyBase}/${key}`
  }

  function onchangeImageFileInput(e: Event) {
    const
      input = e.target as HTMLInputElement,
      file = input.files?.[0]
    if (file) {
      const maybeFileName = file.name
      busy(
        loadImageFromFile(file)
          .then(image => {
            sourceFileName = maybeFileName
            setSourceImage(image)
            showCanvas(sourceCanvas)
            state |= State.haveSource
            state &= ~State.haveEntropy
          })
      )
      .catch(err => console.error(`error loading image:`, err, err.cause ?? ''))
    }
  }

  function onclickCalcButton() {
    const
      sourceImageData = sourceCanvasContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height),
      kernelRadius = getKernelRadius()
    busy(
      calculateEntropy(workers, sourceImageData, kernelRadius)
        .then(image => {
          setEntropyImage(image)
          showCanvas(entropyCanvas)
          state |= State.haveEntropy
          calcedKernelRadius = kernelRadius
        })
    )
    setSettingToStorage(kernelRadiusKey, kernelRadius)
  }

  function onclickSaveButton() {
    const
      d = 1 + 2 * calcedKernelRadius,
      filename = `${removeFileExtension(sourceFileName)} entropy ${d}x${d}.png`
    busy(
      downloadCanvasImage(entropyCanvas, { type: 'image/png', quality: 1 }, filename)
    )
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
      ;[radiusNumberInput, radiusSliderInput].forEach(i => i !== input && (i.valueAsNumber = newValue))
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

  function removeFileExtension(fn: string) {
    const dot = fn.lastIndexOf('.')
    return dot === -1 ? fn : fn.slice(0, dot)
  }

  function setControlsForState(state: State) {
    allControls.forEach(c => c.disabled = !(c[stateKey] & state))
  }

  function setEntropyImage(imageData: ImageData) {
    entropyCanvas.width = imageData.width
    entropyCanvas.height = imageData.height
    entropyCanvasContext.putImageData(imageData, 0, 0)
  }

  function setImageBoxAspectRatio(width: number, height: number) {
    imageBox.style.setProperty('--aspect-ratio', `${width / height}`)
  }

  function setSettingToStorage(key: string, value: any) {
    localStorage.setItem(makeFullStorageKey(key), value)
  }

  function setSourceImage(image: HTMLImageElement) {
    sourceCanvas.width = image.width
    sourceCanvas.height = image.height
    sourceCanvasContext.drawImage(image, 0, 0)
    setImageBoxAspectRatio(sourceCanvas.width, sourceCanvas.height)
  }

  function showCanvas(canvas: HTMLCanvasElement) {
    canvases.forEach(c => c.hidden = c !== canvas)
  }
}
