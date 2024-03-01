// 2024.03.01 Atlee Brink
// TS function signature for spatial_entropy_u8.c as expected in the webassembly exports
// Note: using a dummy function allows better type checking than simply declaring a "type" because of limitations with TypeScript.

export function spatial_entropy_u8(
  radius: number,
  log2_table_byteOffset: number, // Float32Array((radius + 1 + radius)^2)
  width: number,
  height: number,
  in_byteOffset: number, // Uint8Array(width * height) as [height][width]
  out_byteOffset: number // Uint8Array(width * height) as [height][width]
) {
  return // void
}

