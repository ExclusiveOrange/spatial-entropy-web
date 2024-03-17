// 2024.02.28 Atlee Brink
// mostly copied from my Circle Text project

export const
  D = document,
  B = D.body,
  O = Object

export function downloadCanvas(canvas: HTMLCanvasElement, type: string, quality: number, filename: string) {
  const image = canvas.toDataURL(type, quality)
  L('a', {download: filename, href: image, target: '_blank'}).click()
}

// Shorthand for document.createElement and setting properties and styles and appending children.
export function L<K extends keyof HTMLElementTagNameMap, P extends Partial<HTMLElementTagNameMap[K]>>(
  tagName: K,
  props?: P,
  style?: Partial<CSSStyleDeclaration>,
  ...children: (string | Node)[]
): HTMLElementTagNameMap[K] & P {
  const l = D.createElement(tagName)
  if (props) {
    O.assign(l, props)
    if (style) {
      O.assign(l.style, style)
      if (children)
        l.append(...children)
    }
  }
  return l as typeof l & P
}
