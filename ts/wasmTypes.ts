// 2024.03.04 Atlee Brink

export interface WasmMemory {
  initialOffset: number
  memory: WebAssembly.Memory
}