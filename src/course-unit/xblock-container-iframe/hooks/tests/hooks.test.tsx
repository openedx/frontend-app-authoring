import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';

import { messageTypes } from '../../../constants';
import initializeStore from '../../../../store';
import { useMessageHandlers } from '..';

jest.useFakeTimers();

jest.mock('@edx/react-unit-test-utils', () => ({
  useKeyedState: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

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
