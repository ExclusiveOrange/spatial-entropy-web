// 2024.03.06 Atlee Brink

export function sanitizeInteger(x: any, min: number, max: number, def: number): number {
  if (typeof x !== 'number') {
    if (typeof x !== 'string')
      return def
    x = parseInt(x)
  }
  if (!Number.isInteger(x))
    return def
  return Math.max(min, Math.min(x, max))
}
