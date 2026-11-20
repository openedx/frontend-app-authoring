import { initializeMocks, render, screen, userEvent } from '@src/testUtils';
import {
  clampShare,
  ResizableSplit,
  sanitizeShare,
  type ResizableSplitProps,
} from './ResizableSplit';

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
  return { topPane: panes[0], bottomPane: panes[1], bar: screen.getByRole('separator', { name: 'Resize panels' }) };
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
});
