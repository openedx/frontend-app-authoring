import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { act, renderHook } from '@testing-library/react';
import { useKeyedState } from '@edx/react-unit-test-utils';
import { logError } from '@edx/frontend-platform/logging';
import { iframeMessageTypes, iframeStateKeys } from '../../../constants';
import { useIframeBehavior } from '../useIframeBehavior';
import { useLoadBearingHook } from '../useLoadBearingHook';

jest.useFakeTimers();

jest.mock('@edx/react-unit-test-utils', () => ({
  useKeyedState: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('useIframeBehavior', () => {
  const id = 'test-id';
  const iframeUrl = 'http://example.com';
  const setIframeHeight = jest.fn();
  const setHasLoaded = jest.fn();
  const setShowError = jest.fn();
  const setWindowTopOffset = jest.fn();
  const iframeRef = { current: { contentWindow: null } as HTMLIFrameElement };

  beforeEach(() => {
    (useKeyedState as jest.Mock).mockImplementation((key, initialValue) => {
      switch (key) {
        case iframeStateKeys.iframeHeight:
          return [0, setIframeHeight];
        case iframeStateKeys.hasLoaded:
          return [false, setHasLoaded];
        case iframeStateKeys.showError:
          return [false, setShowError];
        case iframeStateKeys.windowTopOffset:
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
    const { result } = renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

    expect(result.current.iframeHeight).toBe(0);
    expect(result.current.showError).toBe(false);
    expect(result.current.hasLoaded).toBe(false);
  });

  it('scrolls to previous position on video fullscreen exit', () => {
    const mockWindowTopOffset = 100;

    (useKeyedState as jest.Mock).mockImplementation((key) => {
      if (key === iframeStateKeys.windowTopOffset) {
        return [mockWindowTopOffset, setWindowTopOffset];
      }
      return [null, jest.fn()];
    });

    renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

    const message = {
      data: {
        type: iframeMessageTypes.videoFullScreen,
        payload: { open: false },
      },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, mockWindowTopOffset);
  });

  it('handles resize message correctly', () => {
    renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

    const message = {
      data: {
        type: iframeMessageTypes.resize,
        payload: { height: 500 },
      },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    // +10 padding
    expect(setIframeHeight).toHaveBeenCalledWith(510);
    expect(setHasLoaded).toHaveBeenCalledWith(true);
  });

  it('handles xblock-event message correctly', () => {
    const onBlockNotification = jest.fn();
    renderHook(() => useIframeBehavior({
      id, iframeUrl, iframeRef, onBlockNotification,
    }));

    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'xblock-event',
        method: 'xblock:cancel',
        someArgs: 'value',
      },
      origin: getConfig().STUDIO_BASE_URL,
    });

    act(() => {
      window.dispatchEvent(messageEvent);
    });

    expect(onBlockNotification).toHaveBeenCalledWith({
      eventType: 'cancel',
      someArgs: 'value',
      type: 'xblock-event',
    });
  });

  it('handles videoFullScreen message correctly', () => {
    renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

    const message = {
      data: {
        type: iframeMessageTypes.videoFullScreen,
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
    renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

    const message = {
      data: { offset: 100 },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(window.scrollY).toBe(100 + (document.getElementById('unit-iframe') as HTMLElement).offsetTop);
  });

  it('handles iframe load error correctly', () => {
    const { result } = renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

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
    const { rerender } = renderHook(({ id, iframeUrl }) => useIframeBehavior({ id, iframeUrl, iframeRef }), {
      initialProps: { id, iframeUrl },
    });

    rerender({ id, iframeUrl: 'http://new-url.com' });

    expect(setIframeHeight).toHaveBeenCalledWith(0);
    expect(setHasLoaded).toHaveBeenCalledWith(false);
  });
});

describe('useLoadBearingHook', () => {
  const setValue = jest.fn();

  beforeEach(() => {
    jest.spyOn(React, 'useState').mockReturnValue([0, setValue]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates state when id changes', () => {
    const { rerender } = renderHook(({ id }) => useLoadBearingHook(id), {
      initialProps: { id: 'initial-id' },
    });

    setValue.mockClear();

    rerender({ id: 'new-id' });

    expect(setValue).toHaveBeenCalledWith(expect.any(Function));
    expect(setValue.mock.calls);
  });
});
