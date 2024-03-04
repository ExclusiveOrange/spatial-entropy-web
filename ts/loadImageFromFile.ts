// 2024.03.03 Atlee Brink

import { loadImageFromURL } from "./loadImageFromURL.js"

export function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader
    reader.onload = () => resolve(loadImageFromURL(reader.result as string, file.name))
    reader.onerror = () => reject(Error(`${file.name} couldn't be loaded: ${reader.error?.message ?? "(this browser's FileReader didn't specify the cause of the error)"}`))
    reader.readAsDataURL(file)
  })
}

