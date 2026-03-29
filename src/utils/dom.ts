/**
 * Check if an element is an input field or contenteditable
 */
export function isInputElement(element: Element | null): boolean {
  if (!element) return false

  const tagName = element.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea'
  const isContentEditable = element.getAttribute('contenteditable') === 'true'

  return isInput || isContentEditable
}
