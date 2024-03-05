// 2024.03.04 Atlee Brink

// TODO: make into webworker job

export async function joinColorChannelsIntoImage(width: number, height: number, c0: Uint8Array, c1: Uint8Array, c2: Uint8Array): Promise<ImageData> {
  const image = new ImageData(width, height)
  const imageAsU32Array = new Uint32Array(image.data.buffer)
  const numPixels = width * height

  for (let i = 0; i < numPixels; ++i)
    imageAsU32Array[i] = 0xff000000 |
      c0[i] |
      c1[i] << 8 |
      c2[i] << 16;

  return image
}
