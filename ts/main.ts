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