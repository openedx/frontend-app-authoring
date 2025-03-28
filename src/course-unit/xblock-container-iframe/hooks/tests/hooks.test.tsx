import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useKeyedState } from '@edx/react-unit-test-utils';
import { initializeMockApp } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';

import { messageTypes } from '../../../constants';
import { mockBroadcastChannel } from '../../../../generic/data/api.mock';
import initializeStore from '../../../../store';
import { useLoadBearingHook, useIFrameBehavior, useMessageHandlers } from '..';
import { iframeMessageTypes, iframeStateKeys } from '../../../../constants';

jest.useFakeTimers();

jest.mock('@edx/react-unit-test-utils', () => ({
  useKeyedState: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

mockBroadcastChannel();

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
    const { result } = renderHook(() => useIFrameBehavior({ id, iframeUrl }));

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

    renderHook(() => useIFrameBehavior({ id, iframeUrl }));

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

describe('useMessageHandlers', () => {
  let handlers;
  let result;
  let store;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }) => (
    <Provider store={store}>
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </IntlProvider>
    </Provider>
  );

  beforeEach(() => {
    handlers = {
      courseId: 'course-v1:Test+101+2025',
      navigate: jest.fn(),
      dispatch: jest.fn(),
      setIframeOffset: jest.fn(),
      handleDeleteXBlock: jest.fn(),
      handleDuplicateXBlock: jest.fn(),
      handleScrollToXBlock: jest.fn(),
      handleManageXBlockAccess: jest.fn(),
      handleShowLegacyEditXBlockModal: jest.fn(),
      handleCloseLegacyEditorXBlockModal: jest.fn(),
      handleSaveEditedXBlockData: jest.fn(),
      handleFinishXBlockDragging: jest.fn(),
    };

    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });

    store = initializeStore();

    ({ result } = renderHook(() => useMessageHandlers(handlers), { wrapper }));
  });

  it('calls handleScrollToXBlock after debounce delay', () => {
    act(() => {
      result.current[messageTypes.scrollToXBlock]({ scrollOffset: 200 });
    });

    jest.advanceTimersByTime(3000);

    expect(handlers.handleScrollToXBlock).toHaveBeenCalledTimes(1);
    expect(handlers.handleScrollToXBlock).toHaveBeenCalledWith(200);
  });

  it.each([
    [messageTypes.editXBlock, { id: 'test-xblock-id' }, 'handleShowLegacyEditXBlockModal', 'test-xblock-id'],
    [messageTypes.closeXBlockEditorModal, {}, 'handleCloseLegacyEditorXBlockModal', undefined],
    [messageTypes.saveEditedXBlockData, {}, 'handleSaveEditedXBlockData', undefined],
    [messageTypes.refreshPositions, {}, 'handleFinishXBlockDragging', undefined],
  ])('calls %s with correct arguments', (messageType, payload, handlerKey, expectedArg) => {
    act(() => {
      result.current[messageType](payload);
    });

    expect(handlers[handlerKey]).toHaveBeenCalledTimes(1);
    if (expectedArg !== undefined) {
      expect(handlers[handlerKey]).toHaveBeenCalledWith(expectedArg);
    }
  });
});
