// 2024.03.19 Atlee Brink
// Async process to encode the image from a canvas to a dataURL suitable for downloading.

export function encodeImageToDataURL(canvas: HTMLCanvasElement, type: string, quality = 1): Promise<string> {
  const
    {width, height} = canvas,
    offscreenCanvas = new OffscreenCanvas(width, height),
    offscreenContext = offscreenCanvas.getContext('2d')!

  offscreenContext.drawImage(canvas, 0, 0)

  return new Promise<string>(async (resolve, reject) => {
    const
      blob = await offscreenCanvas.convertToBlob({type, quality}),
      reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(blob)
  })
}