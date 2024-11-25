import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useKeyedState } from '@edx/react-unit-test-utils';
import { logError } from '@edx/frontend-platform/logging';

import { stateKeys, messageTypes } from '../../constants';
import { useIFrameBehavior, useLoadBearingHook } from '../hooks';

jest.mock('@edx/react-unit-test-utils', () => ({
  useKeyedState: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('useIFrameBehavior', () => {
  const id = 'test-id';
  const iframeUrl = 'http://example.com';
  const setIframeHeight = jest.fn();
  const setHasLoaded = jest.fn();
  const setShowError = jest.fn();
  const setWindowTopOffset = jest.fn();

  beforeEach(() => {
    (useKeyedState as jest.Mock).mockImplementation((key, initialValue) => {
      switch (key) {
        case stateKeys.iframeHeight:
          return [0, setIframeHeight];
        case stateKeys.hasLoaded:
          return [false, setHasLoaded];
        case stateKeys.showError:
          return [false, setShowError];
        case stateKeys.windowTopOffset:
          return [null, setWindowTopOffset];
        default:
          return [initialValue, jest.fn()];
      }
    });

    window.scrollTo = jest.fn((x: number | ScrollToOptions, y?: number): void => {
      const scrollY = typeof x === 'number' ? y : (x as ScrollToOptions).top || 0;
      Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true });
    }) as typeof window.scrollTo;
  });

  it('initializes state correctly', () => {
    const { result } = renderHook(() => useIFrameBehavior({ id, iframeUrl }));

    expect(result.current.iframeHeight).toBe(0);
    expect(result.current.showError).toBe(false);
    expect(result.current.hasLoaded).toBe(false);
  });

  it('scrolls to previous position on video fullscreen exit', () => {
    const mockWindowTopOffset = 100;

    (useKeyedState as jest.Mock).mockImplementation((key) => {
      if (key === stateKeys.windowTopOffset) {
        return [mockWindowTopOffset, setWindowTopOffset];
      }
      return [null, jest.fn()];
    });

    renderHook(() => useIFrameBehavior({ id, iframeUrl }));

    const message = {
      data: {
        type: messageTypes.videoFullScreen,
        payload: { open: false },
      },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, mockWindowTopOffset);
  });

  it('handles resize message correctly', () => {
    renderHook(() => useIFrameBehavior({ id, iframeUrl }));

    const message = {
      data: {
        type: messageTypes.resize,
        payload: { height: 500 },
      },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(setIframeHeight).toHaveBeenCalledWith(500);
    expect(setHasLoaded).toHaveBeenCalledWith(true);
  });

  it('handles videoFullScreen message correctly', () => {
    renderHook(() => useIFrameBehavior({ id, iframeUrl }));

    const message = {
      data: {
        type: messageTypes.videoFullScreen,
        payload: { open: true },
      },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(setWindowTopOffset).toHaveBeenCalledWith(window.scrollY);
  });

  it('handles offset message correctly', () => {
    document.body.innerHTML = '<div id="unit-iframe" style="position: absolute; top: 50px;"></div>';
    renderHook(() => useIFrameBehavior({ id, iframeUrl }));

    const message = {
      data: { offset: 100 },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(window.scrollY).toBe(100 + (document.getElementById('unit-iframe') as HTMLElement).offsetTop);
  });

  it('handles iframe load error correctly', () => {
    const { result } = renderHook(() => useIFrameBehavior({ id, iframeUrl }));

    act(() => {
      result.current.handleIFrameLoad();
    });

    expect(setShowError).toHaveBeenCalledWith(true);
    expect(logError).toHaveBeenCalledWith('Unit iframe failed to load. Server possibly returned 4xx or 5xx response.', {
      iframeUrl,
    });
  });

  it('resets state when iframeUrl changes', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { rerender } = renderHook(({ id, iframeUrl }) => useIFrameBehavior({ id, iframeUrl }), {
      initialProps: { id, iframeUrl },
    });

    rerender({ id, iframeUrl: 'http://new-url.com' });

    expect(setIframeHeight).toHaveBeenCalledWith(0);
    expect(setHasLoaded).toHaveBeenCalledWith(false);
  });
});

describe('useLoadBearingHook', () => {
  it('updates state when id changes', () => {
    const setValue = jest.fn();
    jest.spyOn(React, 'useState').mockReturnValue([0, setValue]);

    const { rerender } = renderHook(({ id }) => useLoadBearingHook(id), {
      initialProps: { id: 'initial-id' },
    });

    setValue.mockClear();

    rerender({ id: 'new-id' });

    expect(setValue).toHaveBeenCalledWith(expect.any(Function));
    expect(setValue.mock.calls);
  });
});
