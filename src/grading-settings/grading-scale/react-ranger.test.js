import { renderHook, act } from '@testing-library/react-hooks';

import { useRanger } from './react-ranger';

describe('useRanger Hook', () => {
  const mockOnChange = jest.fn();
  const mockOnDrag = jest.fn();

  const defaultProps = {
    values: [20, 80],
    min: 0,
    max: 100,
    stepSize: 10,
    onChange: mockOnChange,
    onDrag: mockOnDrag,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default properties', () => {
    const { result } = renderHook(() => useRanger(defaultProps));

    expect(result.current.ticks).toBeDefined();
    expect(result.current.segments).toBeDefined();
    expect(result.current.handles).toHaveLength(2); // Two handles for two values
    expect(result.current.activeHandleIndex).toBeNull();
  });

  it('calculates ticks based on min, max, and stepSize', () => {
    const { result } = renderHook(() => useRanger(defaultProps));

    const tickValues = result.current.ticks.map((tick) => tick.value);
    expect(tickValues).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });

  it('resets active handle index after interaction', () => {
    const { result } = renderHook(() => useRanger(defaultProps));

    act(() => {
      result.current.handles[0].getHandleProps().onMouseDown({ persist: jest.fn() }, 0);
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.activeHandleIndex).toBeNull();
  });

  it('computes segments based on values', () => {
    const { result } = renderHook(() => useRanger(defaultProps));

    const segmentValues = result.current.segments.map((segment) => segment.value);
    expect(segmentValues).toEqual([20, 80, 100]);
  });
});
