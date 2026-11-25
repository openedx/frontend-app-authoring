/** Registers hooks that replace `Element.prototype.scrollIntoView`, which jsdom lacks, with a
 * mock for each test and restore it afterwards. Call it inside a `describe` and assert on the
 * returned mock: `mock.contexts` holds the elements that were scrolled.
 */
export const mockScrollIntoView = (): jest.Mock => {
  const scrollIntoView = jest.fn();
  let original: typeof Element.prototype.scrollIntoView;

  beforeEach(() => {
    original = Element.prototype.scrollIntoView;
    scrollIntoView.mockClear();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = original;
  });

  return scrollIntoView;
};
