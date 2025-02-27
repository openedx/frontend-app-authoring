import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import {
  clipboardUnit,
  clipboardXBlock,
  clipboardUnitLoading,
} from '../../../__mocks__';
import initializeStore from '../../../store';
import { getClipboardUrl } from '../../data/api';
import useClipboard from './useClipboard';

let axiosMock: MockAdapter;
let store: Store;
let queryClient: QueryClient;

const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const xblockId = 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4';
const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
  onmessage: jest.fn(),
};

(global as any).BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const wrapper = ({ children }) => (
  <Provider store={store}>
    <IntlProvider locale="en">
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </IntlProvider>
  </Provider>
);

describe('useClipboard', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    axiosMock.restore();
  });

  describe('clipboard data update effect', () => {
    it('returns falsy flags if canEdit = false', async () => {
      const { result, rerender } = renderHook(() => useClipboard(false), { wrapper });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardUnit);

      await result.current.copyToClipboard(unitId);

      rerender();

      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(false);
    });

    it('returns flag to display the Paste Unit button', async () => {
      const { result, rerender } = renderHook(() => useClipboard(true), { wrapper });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardUnit);

      await result.current.copyToClipboard(unitId);

      rerender();

      expect(result.current.showPasteUnit).toBe(true);
      expect(result.current.showPasteXBlock).toBe(false);
    });

    it('returns flag to display the Paste XBlock button', async () => {
      const { result, rerender } = renderHook(() => useClipboard(true), { wrapper });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardXBlock);

      await result.current.copyToClipboard(xblockId);

      rerender();

      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(true);
    });
  });

  describe('broadcast channel message handling', () => {
    it('updates states correctly on receiving a broadcast message', async () => {
      const { result, rerender } = renderHook(() => useClipboard(true), { wrapper });
      clipboardBroadcastChannelMock.onmessage({ data: clipboardUnit });

      rerender();

      expect(result.current.showPasteUnit).toBe(true);
      expect(result.current.showPasteXBlock).toBe(false);

      clipboardBroadcastChannelMock.onmessage({ data: clipboardXBlock });
      rerender();

      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(true);
    });
  });

  it('shows the current status while copying to clipboard', async () => {
    const { result, rerender } = renderHook(() => useClipboard(true), { wrapper });

    axiosMock
      .onPost(getClipboardUrl())
      .reply(200, clipboardUnitLoading);

    axiosMock
      .onGet(getClipboardUrl())
      .replyOnce(200, clipboardUnitLoading)
      .onGet(getClipboardUrl())
      .replyOnce(200, clipboardUnitLoading)
      .onGet(getClipboardUrl())
      .reply(200, clipboardUnit);

    await act(async () => {
      await result.current.copyToClipboard(unitId);
    });

    rerender();

    expect(result.current.sharedClipboardData).toEqual(clipboardUnit);
    // 3 GET requests are made to check the status of the clipboard data plus 1 GET from the initial render
    expect(axiosMock.history.get.length).toBe(4);
  });
});
