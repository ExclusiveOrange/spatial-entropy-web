// 2024.02.27 Atlee Brink
// Calculates spatial entropy image for one channel (unsigned 8-bit integer)

// originally based on my own C++ implementation from:
// https://github.com/ExclusiveOrange/spatial-entropy-qt/blob/master/entropyfast.cpp
// but I've optimized the algorithm a bit since then

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
{
  int counts[256];
  for (int i = 0; i < 256; ++i)
    counts[i] = 0;

  int num_kernel_pixels = 0;
  int kxa = 0, kxb = min(width, radius + 1);
  int kya = 0, kyb = min(height, radius + 1);

  // prime kernel for [0,0]
  for (int y = 0; y < kyb; ++y)
    for (int x = 0; x < kxb; ++x) {
      uint8_t value = in[y][x];
      ++counts[value];
      ++num_kernel_pixels;
    }

  for (int y = 0; y < height; ++y) {

    const int ky0 = max(0, y - radius);
    const int ky1 = min(height, y + radius + 1);

    // remove top row from counts
    if (kya < ky0) {
      for (int kx = kxa; kx < kxb; ++kx) {
        uint8_t v = in[kya][kx];
        --counts[v];
        --num_kernel_pixels;
      }
      ++kya;
    }

    // add bottom row to counts
    if (kyb < ky1) {
      for (int kx = kxa; kx < kxb; ++kx) {
        uint8_t v = in[kyb][kx];
        ++counts[v];
        ++num_kernel_pixels;
      }
      ++kyb;
    }

    // scan horizontally once
    if ((y & 1) == 0)
      // left to right
      for (int x = 0; x < width; ++x) {

        const int kx0 = max(0, x - radius);
        const int kx1 = min(width, x + radius + 1);

        // horizontal trailing edge
        if (kxa < kx0) {
          for (int ky = kya; ky < kyb; ++ky) {
            uint8_t v = in[ky][kxa];
            --counts[v];
            --num_kernel_pixels;
          }
          ++kxa;
        }

        // horizontal leading edge
        if (kxb < kx1) {
          for (int ky = kya; ky < kyb; ++ky) {
            uint8_t v = in[ky][kxb];
            ++counts[v];
            ++num_kernel_pixels;
          }
          ++kxb;
        }

        // calculate and store this pixel
        out[y][x] = calculate_pixel_entropy(log2_table, counts, num_kernel_pixels);
      }
    else
      // right to left
      for (int x = width - 1; x >= 0; --x) {

        const int kx0 = max(0, x - radius);
        const int kx1 = min(width, x + radius + 1);

        // horizontal trailing edge
        if (kxb > kx1) {
          --kxb;
          for (int ky = kya; ky < kyb; ++ky) {
            uint8_t v = in[ky][kxb];
            --counts[v];
            --num_kernel_pixels;
          }
        }

        // horizontal leading edge
        if (kxa > kx0) {
          --kxa;
          for (int ky = kya; ky < kyb; ++ky) {
            uint8_t v = in[ky][kxa];
            ++counts[v];
            ++num_kernel_pixels;
          }
        }

        // calculate and store this pixel
        out[y][x] = calculate_pixel_entropy(log2_table, counts, num_kernel_pixels);
      }
  }
}

// original: inefficient but simple kernel collection
// {
//   for (int y = 0; y < height; ++y) {
//     uint8_t *p_output_row = out[y];

//     const int kernel_y_min = max(0, y - radius);
//     const int kernel_y_max = min(height, y + radius + 1);

//     for (int x = 0; x < width; ++x) {
//       int counts[256];

//       // #pragma unroll 16 // doesn't help or makes worse, don't use
//       for (int i = 0; i < 256; ++i)
//         counts[i] = 0;

//       int kernel_x_min = max(0, x - radius);
//       int kernel_x_max = min(width, x + radius + 1);

//       for (int kernel_y = kernel_y_min; kernel_y < kernel_y_max; ++kernel_y) {
//         const uint8_t *p_input_row = in[kernel_y];
//         for (int kernel_x = kernel_x_min; kernel_x < kernel_x_max; ++kernel_x) {
//           uint8_t value = p_input_row[kernel_x];
//           ++counts[value];
//         }
//       }

//       const int pixel_count = (kernel_y_max - kernel_y_min) * (kernel_x_max - kernel_x_min);
//       p_output_row[x] = calculate_pixel_entropy(log2_table, counts, pixel_count);
//     }
//   }
// }