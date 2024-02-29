// 2024.02.29 Atlee Brink
// Creates a one dimensional table with n+1 entries where table[0] = 0 and table[i] = log2(i)

export function makeLog2Table(n: number): Float32Array {
  // n + 1 entries

  const table = new Float32Array(n + 1)

  table[0] = 0
  for (let i = 1; i <= n; ++i)
    table[i] = Math.log2(i)

  return table
}