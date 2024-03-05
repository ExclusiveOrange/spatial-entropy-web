// 2024.03.04 Atlee Brink

// TODO: make into webworker job

export async function splitImageIntoColorChannels(image: ImageData): Promise<[Uint8Array, Uint8Array, Uint8Array]> {
  const {width, height} = image
  const numPixels = width * height
  const imageAsU32Array = new Uint32Array(image.data.buffer)

  const c0 = new Uint8Array(numPixels)
  const c1 = new Uint8Array(numPixels)
  const c2 = new Uint8Array(numPixels)

  for (let i = 0; i < numPixels; ++i) {
    const pixel = imageAsU32Array[i]
    c0[i] = pixel & 0xff
    c1[i] = pixel >> 8 & 0xff
    c2[i] = pixel >> 16 & 0xff
  }

  return [c0, c1, c2]
}
