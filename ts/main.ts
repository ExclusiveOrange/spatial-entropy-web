// 2024.02.27 Atlee Brink

import {B, L} from "./common.js"

// START: messing around
// import { spatial_entropy_u8 } from "../c/spatial_entropy_u8.js"
// import { WorkerQueueAsync } from "./WorkerQueueAsync.js"

// const enum Kind {
//   A = 0,
//   B = 1,
//   LAST = B,
// }

// interface KindFnMap {
//   [Kind.A]: (a: number, b: number) => number
//   [Kind.B]: (s: string) => number
// }

// function makeEmptyFunction<Fn extends (...args: any) => any>() {
//   return (...args: Parameters<Fn>): ReturnType<Fn> => { return 0 as ReturnType<Fn> }
// }

// // this must be concrete so the object keys can be extracted at run time,
// // and it must be <const> so the types can be used at compile time,
// // but the functions don't need to do anything, they just need to have the correct signature
// const EmptyWasmFunctions = <const>{
//   spatial_entropy_u8: makeEmptyFunction<spatial_entropy_u8>(),
// }

// function getWasmExports<Expected extends {[k in keyof any]: any}>(expected: Expected, exports: WebAssembly.Exports) {
//   let ret: {[k in keyof any]: any} = {}

//   Object.entries(expected).forEach(([key, value]) => {
//     const expectedType = typeof value

//     if (!(key in exports))
//       throw Error(`wasm exports are missing: ${key}: ${expectedType}`)

//     const exportedValue = exports[key]
//     const actualType = typeof exportedValue

//     if (actualType !== expectedType)
//       throw Error(`wasm exports has: ${key}: ${actualType} but it should have type ${expectedType}`)

//     ret[key] = exportedValue
//   })

//   return ret as Expected
// }


// // dummy
// declare const exports: WebAssembly.Exports

// const actual = getWasmExports(EmptyWasmFunctions, exports)

// function makePostFunction<K extends keyof KindFnMap>(getWorkerQueue: () => WorkerQueueAsync, kind: K) {
//   return async (...args: Parameters<KindFnMap[K]>) => getWorkerQueue().postMessageAsync<ReturnType<KindFnMap[K]>>({ kind, args })
// }

// function makePostFunctionAny(getWorkerQueue: () => WorkerQueueAsync, kindKey: keyof any, kindValue: any, argsKey: keyof any) {
//   return async (...args: any) => getWorkerQueue().postMessageAsync({ [kindKey]: kindValue, [argsKey]: args })
// }

// declare let getWorkerQueue: () => WorkerQueueAsync;

// // bad: requires getWorkerQueue is in scope
// // const Fns: {[k in Kind]: (...args: Parameters<KindFnMap[k]>) => Promise<ReturnType<KindFnMap[k]>>} = {
// //   [Kind.A]: makePostFunction(getWorkerQueue, Kind.A),
// //   [Kind.B]: makePostFunction(getWorkerQueue, Kind.B)
// // };

// // good: takes getWorkerQueue as argument, which means it can be injected from elsewhere
// function makeWorkerFunctionMap(getWorkerQueue: () => WorkerQueueAsync) {
//   const map: {[k in Kind]: (...args: Parameters<KindFnMap[k]>) => Promise<ReturnType<KindFnMap[k]>>} = {
//     [Kind.A]: makePostFunction(getWorkerQueue, Kind.A),
//     [Kind.B]: makePostFunction(getWorkerQueue, Kind.B)
//   }
//   return map
// }

// const Fns = makeWorkerFunctionMap(getWorkerQueue)

// Fns[Kind.A](5, 10)
// Fns[Kind.B]("hello!")


// // for const enums only!
// function makeWorkerFunctionMap2<K, KTypes>(last: number) {
//   let ret: {[key in number]: any} = {}
//   for (let i = 0; i <= last; ++i) {
//     ret[i] = 5;
//   }
//   return ret as {[k in keyof K]: KTypes[k]}
// }

// const Fns2 = makeWorkerFunctionMap2();

// Fns2[Kind.B]("hello");


// ////////////////////////////////////////////////////////////////////////////////


// function doThing<E extends typeof Kind>() {
// }

// // type TypeA = {
// //   kind: Kind.A
// //   fn: (a: number, b: number) => void
// // }

// // type TypeB = {
// //   kind: Kind.B
// //   fn: (a: string) => void
// // }

// // type Types = TypeA | TypeB

// // interface TypeMap {
// //   A: TypeA
// //   B: TypeB
// // }

// // const enumVal<K extends keyof Kinds> = Kinds[K]

// // function makeObj<K extends keyof Kind>(kind: K, fn: 

// END: messing around

;(() => {
  const worker = new Worker('worker.js')
  const loadButton = L('button', { onclick: () => loadImage(), innerHTML: `Load Image...` })
  const calcButton = L('button', { onclick: () => calcEntropy(), innerHTML: `Calculate Entropy...` })

  B.append(loadButton)

  // TODO: write up a proper reply hander
  worker.onmessage = (e: MessageEvent) => {
    const message = e.data
    console.log(`main: got message from worker`)
    if ('err' in message)
      console.error(`main: message contains an error:`, message.err)
    else if ('return' in message)
      console.log(`main: message contains a return:`, message.return)
    else
      console.log(`main: message didn't contain an error or a recognized return`)
  }

  worker.postMessage({jobUid: 0, jobName: 'spatial_entropy_u8', jobArgs: undefined})

  function calcEntropy() {
    [loadButton, calcButton].forEach(b => b.disabled = true)
  }

  function loadImage() {
  }
})()