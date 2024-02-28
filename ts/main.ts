// 2024.02.27 Atlee Brink

import {B, L} from "./common.js"

(() => {

  const worker = new Worker('worker.js')
  const loadButton = L('button', { onclick: () => loadImage() })
  const calcButton = L('button', { onclick: () => calcEntropy() })

  B.append(loadButton)

  function calcEntropy() {
    [loadButton, calcButton].forEach(b => b.disabled = true)
  }

  function loadImage() {
  }
})();