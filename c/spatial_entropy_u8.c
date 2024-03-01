// 2024.02.27 Atlee Brink
// Calculates spatial entropy image for one channel (unsigned 8-bit integer)

// based on my own C++ implementation from:
// https://github.com/ExclusiveOrange/spatial-entropy-qt/blob/master/entropyfast.cpp

#include <stdint.h>

static inline int min(int a, int b) {
  return a < b ? a : b;
}

static inline int max(int a, int b) {
  return a > b ? a : b;
}

__attribute__((export_name("spatial_entropy_u8")))
// WARNING: if you change this signature then change it in the corresponding d.ts file
void spatial_entropy_u8(
  const int radius,
  const uint8_t log2_table[(radius + 1 + radius) * (radius + 1 + radius)],
  const int width,
  const int height,
  const uint8_t in[height][width],
  uint8_t out[height][width]
) {
  for (int y = 0; y < height; ++y) {
    uint8_t *p_output_row = out[y];

    const int kernel_y_min = max(0, y - radius);
    const int kernel_y_max = min(height, y + radius + 1);

    for (int x = 0; x < width; ++x) {
      int counts[256];

      #pragma unroll 16
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
      const float log2_pixel_count = log2_table[pixel_count];

      float entropy = 0.f;
      for (int i = 0; i < 256; ++i) {
        const int value_count = counts[i];
        entropy -= value_count  * (log2_table[value_count] - log2_pixel_count);
      }

      entropy /= pixel_count;

      const float entropy_limit = log2_pixel_count - log2_table[1]; // -log2(1 / count)
      float proportional_entropy = entropy / entropy_limit;

      // was experimental in spatial-entropy-qt and I like it so I'm keeping it
      proportional_entropy *= proportional_entropy;

      p_output_row[x] = (uint8_t)(255.f * proportional_entropy);
    }
  }
}
