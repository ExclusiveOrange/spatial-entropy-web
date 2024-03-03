// 2024.02.27 Atlee Brink

import { JobResult } from "./WorkerJob.js";
import { WorkerQueueAsync } from "./WorkerQueueAsync.js";
import {B, L} from "./common.js"

;(() => {
  const worker = new Worker('worker.js', {credentials: 'include'})
  const workerQueue = new WorkerQueueAsync(worker)

  const loadButton = L('button', { onclick: () => loadImage(), innerHTML: `Load Image...` })
  const calcButton = L('button', { onclick: () => calcEntropy(), innerHTML: `Calculate Entropy...`, disabled: true })
  B.append(loadButton, calcButton)

  // TESTING: this works
  const buffer = new ArrayBuffer(100)
  const u8arr = new Uint8Array(buffer)
  for (let i = 0; i < 100; ++i)
    u8arr[i] = i

  workerQueue.postJobAsync<JobResult>({ jobName: 'spatial_entropy_u8', jobArgs: {buffer} }, [buffer])
    .then(ret => console.log(`main got response from worker:`, ret))
    .catch(err => console.error(`main got error from worker:`, err, err.cause))

  function calcEntropy() {
    [loadButton, calcButton].forEach(b => b.disabled = true)
  }

  function loadImage() {
  }
})()

// NOTE: copied from circle-text: getImageFromUser.ts (mine)

// creating <input> and putting it in a <button>
// fileInput = El('input', {type: 'file', accept: 'image/*', hidden: true}),
// chooseButton = appendTo(
//   El('label', {className: 'button'}, {scale: '200%'}),
//   "Choose an Image File...",
//   fileInput,
// ),

// connecting to the <input>
// function promiseImageFromChooser(fileInput: HTMLInputElement): ImageSourcePromise {
//   let ret: Partial<ImageSourcePromise> = {}

//   ret.promise = new Promise<ImageSource>((resolve, reject) => {
//     ret.cancel = reject
//     fileInput.onchange = null
//     fileInput.value = ''
//     fileInput.onchange = () => {
//       fileInput.files && resolve({ file: fileInput.files[0] })
//     }
//   }).finally(() => {
//     ret.cancel = undefined
//     fileInput.onchange = null
//   })

//   return ret as ImageSourcePromise
// }