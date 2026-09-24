import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { initializeMockApp, mergeConfig } from '@edx/frontend-platform';
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

  describe('editXBlock routing to a plugin-supplied editor', () => {
    const gamesUsageId = 'block-v1:Org+C+R+type@games+block@gm1';
    const canonicalId = 'org.openedx.frontend.authoring.xblock_editor.games.v1';
    const aliasId = 'xblock_editor_games_slot';
    // The router counts plugin entries; it does not validate them.
    const aPlugin = { op: 'insert', widget: { id: 'games-editor', type: 'DIRECT_PLUGIN', priority: 1 } };

    afterEach(() => {
      mergeConfig({ pluginSlots: {} });
    });

    it('opens the legacy modal when no plugin claims the block type', () => {
      act(() => {
        result.current[messageTypes.editXBlock]({ id: gamesUsageId });
      });
      expect(handlers.handleShowLegacyEditXBlockModal).toHaveBeenCalledWith(gamesUsageId);
      expect(handlers.handleEditXBlock).not.toHaveBeenCalled();
    });

    it.each([
      ['canonical slot id', canonicalId],
      ['documented alias', aliasId],
    ])('opens the plugin editor when registered under the %s', (_label, slotId) => {
      mergeConfig({ pluginSlots: { [slotId]: { keepDefault: false, plugins: [aPlugin] } } });
      act(() => {
        result.current[messageTypes.editXBlock]({ id: gamesUsageId });
      });
      expect(handlers.handleEditXBlock).toHaveBeenCalledWith('games', gamesUsageId);
      expect(handlers.handleShowLegacyEditXBlockModal).not.toHaveBeenCalled();
    });

    // A slot entry with no plugins is the same as no entry: nothing to render.
    // Routing it here would open the blank AdvancedEditor instead of the
    // legacy modal.
    it.each([
      ['an empty plugins list', { keepDefault: false, plugins: [] }],
      ['only keepDefault set', { keepDefault: true }],
    ])('opens the legacy modal when the slot has %s', (_label, slotConfig) => {
      mergeConfig({ pluginSlots: { [canonicalId]: slotConfig } });
      act(() => {
        result.current[messageTypes.editXBlock]({ id: gamesUsageId });
      });
      expect(handlers.handleShowLegacyEditXBlockModal).toHaveBeenCalledWith(gamesUsageId);
      expect(handlers.handleEditXBlock).not.toHaveBeenCalled();
    });

    // When both the canonical id and the alias are configured, PluginSlot uses
    // only the LAST matching entry (usePluginSlot's findLast). The router must
    // judge the same entry, or it would route a block to an editor that the
    // slot will then render without any plugin.
    describe('when both the canonical id and the alias are configured', () => {
      const populated = { keepDefault: false, plugins: [aPlugin] };
      const empty = { keepDefault: false, plugins: [] };

      it('opens the legacy modal when the later entry is empty', () => {
        mergeConfig({ pluginSlots: { [canonicalId]: populated, [aliasId]: empty } });
        act(() => {
          result.current[messageTypes.editXBlock]({ id: gamesUsageId });
        });
        expect(handlers.handleShowLegacyEditXBlockModal).toHaveBeenCalledWith(gamesUsageId);
        expect(handlers.handleEditXBlock).not.toHaveBeenCalled();
      });

      it('opens the plugin editor when the later entry has a plugin', () => {
        mergeConfig({ pluginSlots: { [aliasId]: empty, [canonicalId]: populated } });
        act(() => {
          result.current[messageTypes.editXBlock]({ id: gamesUsageId });
        });
        expect(handlers.handleEditXBlock).toHaveBeenCalledWith('games', gamesUsageId);
        expect(handlers.handleShowLegacyEditXBlockModal).not.toHaveBeenCalled();
      });
    });
  });
});
