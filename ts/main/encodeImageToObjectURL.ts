// 2024.03.19 Atlee Brink
// Async process to encode the image from a canvas to a dataURL suitable for downloading.

// WARNING: URL should be revoked sometime after use with URL.revokeObjectURL(url).
// I can't find clear documentation about the timing of revocation but common belief is that setTimeout((revoke it here), 0) works.
export async function encodeImageToObjectURL(canvas: HTMLCanvasElement, type: string, quality = 1): Promise<string> {
  const
    {width, height} = canvas,
    offscreenCanvas = new OffscreenCanvas(width, height),
    offscreenContext = offscreenCanvas.getContext('2d')!

  offscreenContext.drawImage(canvas, 0, 0)

  // WARNING: supposed to revoke this URL after use
  return URL.createObjectURL(await offscreenCanvas.convertToBlob({ type, quality }))
}