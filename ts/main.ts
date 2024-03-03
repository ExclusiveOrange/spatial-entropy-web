// 2024.02.27 Atlee Brink

import { WorkerQueueAsync } from "./WorkerQueueAsync.js";
import {B, L} from "./common.js"

;(() => {
  const worker = new Worker('worker.js')
  const workerQueue = new WorkerQueueAsync(worker)

  const loadButton = L('button', { onclick: () => loadImage(), innerHTML: `Load Image...` })
  const calcButton = L('button', { onclick: () => calcEntropy(), innerHTML: `Calculate Entropy...`, disabled: true })
  B.append(loadButton, calcButton)

  workerQueue.postJobAsync({ jobName: 'spatial_entropy_u8', jobArgs: 0 })
    .then(ret => console.log(`main got response from worker:`, ret))
    .catch(err => console.error(`main got error from worker:`, err, err.cause))

  function calcEntropy() {
    [loadButton, calcButton].forEach(b => b.disabled = true)
  }

  function loadImage() {
  }
})()