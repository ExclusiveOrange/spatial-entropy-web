// 2024.03.03 Atlee Brink

export function loadImageFromURL(url: string, filename?: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image
    image.onload = () => resolve(image)
    image.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) =>
      reject(Error(`${filename ?? "String"} can't be used as an Image: ${error ?? "(this browser's Image loader didn't specify the cause of the error)"}`))
    image.src = url
  })
}
