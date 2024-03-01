// 2024.02.29 Atlee Brink
// TS type
// I made this manually. Don't delete this file.

export type spatial_entropy_u8 = (
  radius: number,
  log2_table_byteOffset: number, // Float32Array((radius + 1 + radius)^2)
  width: number,
  height: number,
  in_byteOffset: number, // Uint8Array(width * height) as [height][width]
  out_byteOffset: number // Uint8Array(width * height) as [height][width]
) => void
