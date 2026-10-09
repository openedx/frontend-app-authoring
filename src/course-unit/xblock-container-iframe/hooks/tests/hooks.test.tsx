import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { initializeMockApp } from '@edx/frontend-platform';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';

import { messageTypes } from '../../../constants';
import initializeStore from '../../../../store';
import { useMessageHandlers } from '..';

jest.useFakeTimers();

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
      handleUnlinkXBlock: jest.fn(),
      handleDuplicateXBlock: jest.fn(),
      handleScrollToXBlock: jest.fn(),
      handleManageXBlockAccess: jest.fn(),
      handleShowLegacyEditXBlockModal: jest.fn(),
      handleEditXBlock: jest.fn(),
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

    mockWaffleFlags();
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

  // Studio only sends `newXBlockEditor` for the block types it knows this app
  // edits; every other Edit click arrives as a legacy-modal request. This app
  // knows its own editors, so it opens one of those itself.
  describe('editXBlock routing', () => {
    const usageId = (type: string) => `block-v1:Test+101+2025+type@${type}+block@abc`;

    it('opens the built-in editor for a block type this app can edit', () => {
      act(() => {
        result.current[messageTypes.editXBlock]({ id: usageId('games') });
      });
      expect(handlers.handleEditXBlock).toHaveBeenCalledWith('games', usageId('games'));
      expect(handlers.handleShowLegacyEditXBlockModal).not.toHaveBeenCalled();
    });

    it('opens the legacy modal for a block type this app cannot edit', () => {
      act(() => {
        result.current[messageTypes.editXBlock]({ id: usageId('drag-and-drop-v2') });
      });
      expect(handlers.handleShowLegacyEditXBlockModal).toHaveBeenCalledWith(usageId('drag-and-drop-v2'));
      expect(handlers.handleEditXBlock).not.toHaveBeenCalled();
    });

    it('opens the legacy modal when the operator has opted out of a built-in editor', () => {
      mockWaffleFlags({ useNewPdfEditor: false });
      ({ result } = renderHook(() => useMessageHandlers(handlers), { wrapper }));
      act(() => {
        result.current[messageTypes.editXBlock]({ id: usageId('pdf') });
      });
      expect(handlers.handleShowLegacyEditXBlockModal).toHaveBeenCalledWith(usageId('pdf'));
      expect(handlers.handleEditXBlock).not.toHaveBeenCalled();
    });
  });
});
