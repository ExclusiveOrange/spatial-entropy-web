// 2024.02.28 Atlee Brink
// mostly copied from my Circle Text project

export const
  D = document,
  B = D.body,
  O = Object

// Shorthand for document.createElement and setting properties and styles and appending children.
export function L<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  props?: Partial<HTMLElementTagNameMap[K]>,
  style?: Partial<CSSStyleDeclaration>,
  ...children: (string | Node)[]
): HTMLElementTagNameMap[K] {
  const l = D.createElement(tagName)
  if (props) {
    O.assign(l, props)
    if (style) {
      O.assign(l.style, style)
      if (children)
        l.append(...children)
    }
  }
  return l
}

// type Tuple from: https://stackoverflow.com/a/65914848
// nice way way to generate the type of an arbitrary length (but known at compile time) tuple with a single element type
export type Tuple<T, N extends number, A extends any[] = []> = A extends { length: N } ? A : Tuple<T, N, [...A, T]>

// repeats f, n times, and returns the results as a tuple
export function rep<N extends number, T>(n: N, f: () => T) {
  const arr = new Array<T>(n)
  for (let i = 0; i <= n; ++i)
    arr[i] = f()
  return arr as Tuple<T, N>
}