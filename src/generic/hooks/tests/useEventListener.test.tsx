import { renderHook } from '@testing-library/react-hooks';

import { useEventListener } from '../useEventListener';

describe('useEventListener', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(global, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(global, 'removeEventListener');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add event listener on mount', () => {
    const handler = jest.fn();
    renderHook(() => useEventListener('click', handler));

    expect(addEventListenerSpy).toHaveBeenCalledWith('click', handler);
  });

  it('should remove event listener on unmount', () => {
    const handler = jest.fn();
    const { unmount } = renderHook(() => useEventListener('click', handler));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', handler);
  });

  it('should update event listener when handler changes', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const { rerender } = renderHook(({ handler }: {
      handler: (event: Event) => void
    }) => useEventListener('click', handler), {
      initialProps: { handler: handler1 },
    });

    rerender({ handler: handler2 });

    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', handler1);
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', handler2);
  });

  it('should update event listener when type changes', () => {
    const handler = jest.fn();
    const { rerender } = renderHook(({ type }: {
      type: keyof WindowEventMap
    }) => useEventListener(type, handler), {
      initialProps: { type: 'click' },
    });

    rerender({ type: 'scroll' });

    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', handler);
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', handler);
  });
});
