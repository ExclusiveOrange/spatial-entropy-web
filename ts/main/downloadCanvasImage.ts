// 2024.03.21 Atlee Brink
// Encodes a canvas image as the specified image type and then downloads it in the browser.

import { L } from "../common/common.js"

export async function downloadCanvasImage(
  canvas: HTMLCanvasElement,
  options: ImageEncodeOptions, // such as {type: 'image/png', quality: 1} or {type: 'image/jpeg', quality: 0.5} or {type: 'image/webp', quality: 0.7}
  filename: string // you must put the file extension on this if you want it to have one, otherwise the browser might not add it
) {
  const
    {width, height} = canvas,
    offscreenCanvas = new OffscreenCanvas(width, height),
    offscreenContext = offscreenCanvas.getContext('2d')!

  offscreenContext.drawImage(canvas, 0, 0)

  const
    blob = await offscreenCanvas.convertToBlob(options),
    url = URL.createObjectURL(blob)
  
  // Create a temporary link and click it.
  // It doesn't seem to be necessary to put this in the document body.
  L('a', { download: filename, href: url, target: '_blank' }).click()

  // The common belief on the web is that deferring revoke to the next event loop is sufficient after clicking a download link.
  // If this is problematic then another solution would be to store the url in a global var and only revoke it when this function is called again later.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
