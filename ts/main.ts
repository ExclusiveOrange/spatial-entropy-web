// 2024.02.27 Atlee Brink

import { JobSuccess_spatial_entropy_u8, Job_spatial_entropy_u8 } from "./WorkerJobs.js";
import { WorkerQueueAsync } from "./WorkerQueueAsync.js";
import {B, L} from "./common.js"

;import { loadImageFromFile } from "./loadImageFromFile.js";
(() => {
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

  const calcButton = L('button', { onclick: () => calculateEntropy(), innerHTML: `Calculate Entropy...`, disabled: true })

  // The display <canvas> for the input image.
  // Used to preview the image and as the image data source.
  const sourceCanvas = L('canvas', { width: 1, height: 1 })
  const sourceCanvasContext = sourceCanvas.getContext('2d') as CanvasRenderingContext2D
  const entropyCanvas = L('canvas', { width: 1, height: 1 })

  B.append(loadButton, calcButton, sourceCanvas, entropyCanvas)

  // TESTING: this works
  // const buffer = new ArrayBuffer(100)
  // const u8arr = new Uint8Array(buffer)
  // for (let i = 0; i < 100; ++i)
  //   u8arr[i] = i

  // workerQueue.postJobAsync<JobResult>({ jobName: 'spatial_entropy_u8', jobArgs: {buffer} }, [buffer])
  //   .then(ret => console.log(`main got response from worker:`, ret))
  //   .catch(err => console.error(`main got error from worker:`, err, err.cause))

  function calculateEntropy() {

    const {width, height} = sourceCanvas
    const numPixels = width * height

    const sourceImageData = sourceCanvasContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
    const u32Array = new Uint32Array(sourceImageData.data)

    const pendingJobs = Promise.all([0, 1, 2].map(ichannel => {

      const u8Array = new Uint8ClampedArray(width * height)
      for (let i = 0; i < numPixels; ++i)
        u8Array[i] = u32Array[i] >> (ichannel * 8) & 255

      const job: Job_spatial_entropy_u8 = {
        jobName: 'spatial_entropy_u8',
        jobArgs: {
          arrayBuffer: u8Array.buffer,
          width,
          height
        }
      }

      return workerQueue.postJobAsync<JobSuccess_spatial_entropy_u8>(job, [job.jobArgs.arrayBuffer])
    }))

    pendingJobs.catch(err => console.error(`worker didn't calculate entropy:`, err, err?.cause ?? ''))
    pendingJobs.then(successes => {
      // TODO
      console.log('all channels done')
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
