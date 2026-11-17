/** Matches the element whose `textContent` is `text`. Testing Library's string matcher reads only an element's
 * own text nodes, so it misses text split by a `<strong>`.
 */
export const byTextContent = (text: string) => (_content: string, element: Element | null) =>
  element?.textContent === text;
