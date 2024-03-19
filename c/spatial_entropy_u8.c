// 2024.02.27 Atlee Brink
// Calculates spatial entropy image for one channel (unsigned 8-bit integer)

// based on my own C++ implementation from:
// https://github.com/ExclusiveOrange/spatial-entropy-qt/blob/master/entropyfast.cpp

/* TODO: optimizations

  Simple:
    use separate inner loops for the boundaries of the image where the kernel goes outside,
    versus the interior of the image where the kernel is fully inside.

  Complicated:
    Adjust 'counts' on the edges of the kernel as the kernel moves.
    That ought to require far fewer memory reads, as only the leading and trailing edges need be read.
    However it is more complicated to keep track of exactly which pixels need to be added or subtracted
    when starting a run or moving down a row; also it may be more efficient to scan alternately left-right.

*/

/* Complicated:

  C := counts[256]
  > prime C for first pixel
  left to right:
    lead in
    middle
    trail out
  top to bottom:
    left to right
    down
    right to left
*/

#include <stdint.h>

static inline int min(int a, int b) {
  return a < b ? a : b;
}

static inline int max(int a, int b) {
  return a > b ? a : b;
}

uint8_t calculate_pixel_entropy(
  const float *log2_table, // [max_num_kernel_pixels + 1]
  const int counts[256],
  const int pixel_count
) {
  float entropy = 0.f;
  #pragma unroll 16 // helps a bit on i7-9700k
  for (int i = 0; i < 256; ++i) {
    const int value_count = counts[i];
    entropy -= log2_table[value_count];
  }

  float proportional_entropy = 1 + entropy / log2_table[pixel_count];

  // was experimental in spatial-entropy-qt and I like it so I'm keeping it
  proportional_entropy *= proportional_entropy;

  return (uint8_t)(255.f * proportional_entropy);
}

__attribute__((export_name("spatial_entropy_u8")))
// WARNING: if you change this signature then change it in the corresponding d.ts file
void spatial_entropy_u8(
  const int radius,
  const float log2_table[(radius + 1 + radius) * (radius + 1 + radius) + 1], // [0]=0, [i]=i*log2(i)
  const int width,
  const int height,
  const uint8_t in[height][width],
  uint8_t out[height][width]
)
// original: inefficient kernel collection
{
  for (int y = 0; y < height; ++y) {
    uint8_t *p_output_row = out[y];

    const int kernel_y_min = max(0, y - radius);
    const int kernel_y_max = min(height, y + radius + 1);

    for (int x = 0; x < width; ++x) {
      int counts[256];

      // #pragma unroll 16 // doesn't help or makes worse, don't use
      for (int i = 0; i < 256; ++i)
        counts[i] = 0;

      int kernel_x_min = max(0, x - radius);
      int kernel_x_max = min(width, x + radius + 1);

      for (int kernel_y = kernel_y_min; kernel_y < kernel_y_max; ++kernel_y) {
        const uint8_t *p_input_row = in[kernel_y];
        for (int kernel_x = kernel_x_min; kernel_x < kernel_x_max; ++kernel_x) {
          uint8_t value = p_input_row[kernel_x];
          ++counts[value];
        }
      }

      const int pixel_count = (kernel_y_max - kernel_y_min) * (kernel_x_max - kernel_x_min);
      p_output_row[x] = calculate_pixel_entropy(log2_table, counts, pixel_count);
    }
  }
}