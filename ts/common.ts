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