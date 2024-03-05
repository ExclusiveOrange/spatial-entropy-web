// 2024.03.04 Atlee Brink

export type Wasm<Imports extends {[k in keyof any]: any}> = {
  instance: WebAssembly.Instance
  memory: WasmMemory
  imports: Imports
}

export interface WasmMemory {
  initialOffset: number
  memory: WebAssembly.Memory
}