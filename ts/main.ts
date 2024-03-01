// 2024.02.27 Atlee Brink

import {B, L} from "./common.js"

// START: messing around
// import { spatial_entropy_u8 } from "../c/spatial_entropy_u8.js"

// const enum Kind {
//   A = 0,
//   B = 1,
// }

// interface KindFnMap {
//   [Kind.A]: spatial_entropy_u8
//   [Kind.B]: (s: string) => number
// }

// let fn: spatial_entropy_u8

// // TODO: finish hooking this up and then move it into 

// const Fns: {[k in Kind]: (worker: Worker, ...args: Parameters<KindFnMap[k]>) => Promise<ReturnType<KindFnMap[k]>>} = {
//   [Kind.A]: (worker: Worker, ...args: Parameters<KindFnMap[Kind.A]>) => postTask(worker, Kind.A, ...args),
//   [Kind.B]: (worker: Worker, ...args: Parameters<KindFnMap[Kind.B]>) => postTask(worker, Kind.B, ...args),
// }

// type TypeA = {
//   kind: Kind.A
//   fn: (a: number, b: number) => void
// }

// type TypeB = {
//   kind: Kind.B
//   fn: (a: string) => void
// }

// type Types = TypeA | TypeB

// interface TypeMap {
//   A: TypeA
//   B: TypeB
// }

// const enumVal<K extends keyof Kinds> = Kinds[K]

// function makeObj<K extends keyof Kind>(kind: K, fn: 

// END: messing around




(() => {
  const worker = new Worker('worker.js')
  const loadButton = L('button', { onclick: () => loadImage(), innerHTML: `Load Image...` })
  const calcButton = L('button', { onclick: () => calcEntropy(), innerHTML: `Calculate Entropy...` })

  B.append(loadButton)

  worker.postMessage('hello from main')

  function calcEntropy() {
    [loadButton, calcButton].forEach(b => b.disabled = true)
  }

  function loadImage() {
  }
})();