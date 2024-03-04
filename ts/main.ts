// 2024.02.27 Atlee Brink

import { JobResult } from "./WorkerJob.js";
import { WorkerQueueAsync } from "./WorkerQueueAsync.js";
import {B, L} from "./common.js"

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
        .then(setSourceImage)
        .catch(err => console.error(`error loading image:`, err, err.cause ?? ''))
  }

  B.append(loadButton)

  // const calcButton = L('button', { onclick: () => calcEntropy(), innerHTML: `Calculate Entropy...`, disabled: true })

  // The display <canvas> for the input image.
  // Used to preview the image and as the image data source.
  const sourceCanvas = L('canvas', {className: 'source', width: 1, height: 1})

  B.append(sourceCanvas)

  // TESTING: this works
  // const buffer = new ArrayBuffer(100)
  // const u8arr = new Uint8Array(buffer)
  // for (let i = 0; i < 100; ++i)
  //   u8arr[i] = i

  // workerQueue.postJobAsync<JobResult>({ jobName: 'spatial_entropy_u8', jobArgs: {buffer} }, [buffer])
  //   .then(ret => console.log(`main got response from worker:`, ret))
  //   .catch(err => console.error(`main got error from worker:`, err, err.cause))

  function loadImageFromFile(file: File) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader
      reader.onload = () => resolve(loadImageFromURL(reader.result as string, file.name))
      reader.onerror = () => reject(Error(`${file.name} couldn't be loaded: ${reader.error?.message ?? "(this browser's FileReader didn't specify the cause of the error)"}`))
      reader.readAsDataURL(file)
    })
  }

  function loadImageFromURL(url: string, filename: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image
      image.onload = () => resolve(image)
      image.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) =>
        reject(Error(`${filename} was loaded as a file but can't be used as an Image: ${error ?? "(this browser's Image loader didn't specify the cause of the error)"}`))
      image.src = url
    })
  }

  function setSourceImage(image: HTMLImageElement) {
    sourceCanvas.width = image.width
    sourceCanvas.height = image.height
    const context = sourceCanvas.getContext('2d') as CanvasRenderingContext2D
    context?.drawImage(image, 0, 0)
  }
})()
