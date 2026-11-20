import { act, fireEvent, initializeMocks, render, screen, userEvent } from '@src/testUtils';
import {
  clampShare,
  ResizableSplit,
  sanitizeShare,
  type ResizableSplitProps,
} from './ResizableSplit';

// jsdom 20 has no PointerEvent, so Testing Library would build a plain Event and drop `clientY`.
class PointerEventPolyfill extends MouseEvent {
  pointerId: number;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}
(window as any).PointerEvent = PointerEventPolyfill;
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();

const resizeCallbacks = new Map<Element, ResizeObserverCallback>();
const originalResizeObserver = window.ResizeObserver;
let clientHeightSpy: jest.SpyInstance;

const measure = (container: HTMLElement) => {
  const root = container.querySelector('.resizable-split')!;
  act(() => resizeCallbacks.get(root)!([], {} as ResizeObserver));
};

const drag = (bar: HTMLElement, startY: number, endY: number) => {
  fireEvent.pointerDown(bar, { clientY: startY, pointerId: 1, button: 0 });
  fireEvent.pointerMove(bar, { clientY: endY, pointerId: 1 });
  fireEvent.pointerUp(bar, { pointerId: 1 });
};

const renderSplit = (props: Partial<ResizableSplitProps> = {}) => {
  const { container } = render(
    <ResizableSplit
      top={<div>Top content</div>}
      bottom={<div>Bottom content</div>}
      storageKey="split-key"
      ariaLabel="Resize panels"
      {...props}
    />,
  );
  const panes = container.querySelectorAll<HTMLElement>('.resizable-split__pane');
  return {
    container,
    topPane: panes[0],
    bottomPane: panes[1],
    bar: screen.getByRole('separator', { name: 'Resize panels' }),
  };
};

describe('sanitizeShare', () => {
  it.each([[0.3, 0.3], [0, 0], [1, 1]])('keeps %p', (input, expected) => {
    expect(sanitizeShare(input)).toBe(expected);
  });
  it.each([undefined, null, 'x', '0.3', NaN, Infinity, -0.1, 1.5, {}])('falls back to 0.5 for %p', (input) => {
    expect(sanitizeShare(input)).toBe(0.5);
  });
});

describe('clampShare', () => {
  it('returns the share unchanged before the container is measured', () => {
    expect(clampShare(0.9, 0, 120)).toBe(0.9);
  });
  it('clamps to the minimum panel height on both ends', () => {
    expect(clampShare(0.05, 600, 120)).toBe(0.2);
    expect(clampShare(0.95, 600, 120)).toBe(0.8);
    expect(clampShare(0.5, 600, 120)).toBe(0.5);
  });
  it('falls back to an even split when both minimums do not fit', () => {
    expect(clampShare(0.9, 200, 120)).toBe(0.5);
  });
});

describe('<ResizableSplit />', () => {
  beforeEach(() => {
    initializeMocks();
    window.localStorage.clear();
    resizeCallbacks.clear();
    window.ResizeObserver = class {
      private callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(element: Element) {
        resizeCallbacks.set(element, this.callback);
      }

      unobserve() {}

      disconnect() {}
    };
    clientHeightSpy = jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
  });

  afterEach(() => {
    clientHeightSpy.mockRestore();
    window.ResizeObserver = originalResizeObserver;
  });

  it('renders both slots around an accessible horizontal separator at an even split', () => {
    const { topPane, bottomPane, bar } = renderSplit();
    expect(topPane).toHaveTextContent('Top content');
    expect(bottomPane).toHaveTextContent('Bottom content');
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('tabindex', '0');
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.5);
    expect(Number(bottomPane.style.flexGrow)).toBeCloseTo(0.5);
  });

  it('shrinks the top pane on ArrowUp and grows it on ArrowDown by one step', async () => {
    const user = userEvent.setup();
    const { topPane, bottomPane, bar } = renderSplit();
    bar.focus();
    await user.keyboard('{ArrowUp}');
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.45);
    expect(Number(bottomPane.style.flexGrow)).toBeCloseTo(0.55);
    expect(bar).toHaveAttribute('aria-valuenow', '45');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.55);
    expect(bar).toHaveAttribute('aria-valuenow', '55');
  });

  it('ignores other keys', async () => {
    const user = userEvent.setup();
    const { topPane, bar } = renderSplit();
    bar.focus();
    await user.keyboard('{ArrowLeft}{Home}{Enter}');
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.5);
  });

  it('moves the split by the dragged distance over the measured height', () => {
    const { container, topPane, bar } = renderSplit();
    measure(container); // 600px available
    drag(bar, 100, 160); // 60px down = +0.1
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.6);
    expect(bar).toHaveAttribute('aria-valuenow', '60');
    drag(bar, 100, 40); // 60px up from 0.6
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.5);
  });

  it('keeps the bar under the pointer while dragging, before release', () => {
    const { container, topPane, bar } = renderSplit();
    measure(container);
    fireEvent.pointerDown(bar, { clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientY: 130, pointerId: 1 });
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.55);
    expect(Element.prototype.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('clamps a drag at each panel\'s minimum height', () => {
    const { container, topPane, bar } = renderSplit();
    measure(container);
    drag(bar, 100, -1000);
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.2); // 120 / 600
    drag(bar, 100, 2000);
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.8);
  });

  it('clamps the arrow keys at the minimum height too', async () => {
    const user = userEvent.setup();
    const { container, topPane, bar } = renderSplit();
    measure(container);
    drag(bar, 100, -1000); // at 0.2
    bar.focus();
    await user.keyboard('{ArrowUp}');
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.2);
  });

  it('re-clamps the displayed share when the container shrinks and restores it when it grows', () => {
    const { container, topPane, bar } = renderSplit();
    measure(container); // 600
    drag(bar, 100, 280); // +0.3 -> 0.8, the max at 600px
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.8);
    clientHeightSpy.mockReturnValue(400); // max becomes 0.7
    measure(container);
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.7);
    clientHeightSpy.mockReturnValue(600);
    measure(container);
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.8);
  });

  it('ignores a secondary-button press', () => {
    const { container, topPane, bar } = renderSplit();
    measure(container);
    fireEvent.pointerDown(bar, { clientY: 100, pointerId: 1, button: 2 });
    fireEvent.pointerMove(bar, { clientY: 160, pointerId: 1 });
    fireEvent.pointerUp(bar, { pointerId: 1 });
    expect(Number(topPane.style.flexGrow)).toBeCloseTo(0.5);
  });
});
