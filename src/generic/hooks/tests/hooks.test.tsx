import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { act, renderHook } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import { iframeMessageTypes } from '../../../constants';
import { useIframeBehavior, iframeBehaviorState } from '../useIframeBehavior';
import { useLoadBearingHook } from '../useLoadBearingHook';

jest.useFakeTimers();

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
    jest.spyOn(iframeBehaviorState, 'iframeHeight').mockImplementation(() => [0, setIframeHeight]);
    jest.spyOn(iframeBehaviorState, 'hasLoaded').mockImplementation(() => [false, setHasLoaded]);
    jest.spyOn(iframeBehaviorState, 'showError').mockImplementation(() => [false, setShowError]);
    jest.spyOn(iframeBehaviorState, 'windowTopOffset').mockImplementation(() => [null, setWindowTopOffset]);

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
    jest.spyOn(iframeBehaviorState, 'windowTopOffset').mockImplementation(() => [mockWindowTopOffset, setWindowTopOffset]);
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

  it('handles xblockScroll message correctly', () => {
    const iframeElement = document.createElement('iframe');
    iframeElement.setAttribute('name', 'xblock-iframe');
    Object.defineProperty(iframeElement, 'offsetTop', { writable: true, configurable: true, value: 50 });

    const iframeParentElement = document.createElement('div');
    iframeParentElement.setAttribute('id', 'div0');
    Object.defineProperty(iframeParentElement, 'offsetTop', { writable: true, configurable: true, value: 25 });

    iframeParentElement.appendChild(iframeElement);
    document.body.appendChild(iframeParentElement);

    renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

    const message = {
      data: {
        type: iframeMessageTypes.xblockScroll,
        offset: 100,
      },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 175, left: 0, behavior: 'smooth' });
    expect(window.scrollY).toBe(100 + document.getElementsByName('xblock-iframe')[0].offsetTop + document.getElementsByName('xblock-iframe')[0]!.parentElement!.offsetTop);
  });

  it('handles offset message correctly', () => {
    const iframeElement = document.createElement('iframe');
    iframeElement.setAttribute('id', 'unit-iframe');
    Object.defineProperty(iframeElement, 'offsetTop', { writable: true, configurable: true, value: 50 });

    document.body.appendChild(iframeElement);

    renderHook(() => useIframeBehavior({ id, iframeUrl, iframeRef }));

    const message = {
      data: { offset: 100 },
    };

    act(() => {
      window.dispatchEvent(new MessageEvent('message', message));
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 150);
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
