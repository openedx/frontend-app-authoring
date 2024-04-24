import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../../store';
import { executeThunk } from '../../../utils';
import { clipboardUnit, clipboardXBlock } from '../../../__mocks__';
import { copyToClipboard } from '../../data/thunks';
import { getClipboardUrl } from '../../data/api';
import useCopyToClipboard from './useCopyToClipboard';

let axiosMock;
let store;
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const xblockId = 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4';
const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

global.BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const wrapper = ({ children }) => (
  <Provider store={store}>
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  </Provider>
);

describe('useCopyToClipboard', () => {
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
  });

  it('initializes correctly', () => {
    const { result } = renderHook(() => useCopyToClipboard(true), { wrapper });

    expect(result.current.showPasteUnit).toBe(false);
    expect(result.current.showPasteXBlock).toBe(false);
  });

  describe('clipboard data update effect', () => {
    it('returns falsy flags if canEdit = false', async () => {
      const { result } = renderHook(() => useCopyToClipboard(false), { wrapper });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardUnit);
      axiosMock
        .onGet(getClipboardUrl())
        .reply(200, clipboardUnit);

      await act(async () => {
        await executeThunk(copyToClipboard(unitId), store.dispatch);
      });
      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(false);
    });

    it('returns flag to display the Paste Unit button', async () => {
      const { result } = renderHook(() => useCopyToClipboard(true), { wrapper });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardUnit);
      axiosMock
        .onGet(getClipboardUrl())
        .reply(200, clipboardUnit);

      await act(async () => {
        await executeThunk(copyToClipboard(unitId), store.dispatch);
      });
      expect(result.current.showPasteUnit).toBe(true);
      expect(result.current.showPasteXBlock).toBe(false);
    });

    it('returns flag to display the Paste XBlock button', async () => {
      const { result } = renderHook(() => useCopyToClipboard(true), { wrapper });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardXBlock);
      axiosMock
        .onGet(getClipboardUrl())
        .reply(200, clipboardXBlock);

      await act(async () => {
        await executeThunk(copyToClipboard(xblockId), store.dispatch);
      });
      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(true);
    });
  });

  describe('broadcast channel message handling', () => {
    it('updates states correctly on receiving a broadcast message', async () => {
      const { result } = renderHook(() => useCopyToClipboard(true), { wrapper });
      clipboardBroadcastChannelMock.onmessage({ data: clipboardUnit });

      expect(result.current.showPasteUnit).toBe(true);
      expect(result.current.showPasteXBlock).toBe(false);

      clipboardBroadcastChannelMock.onmessage({ data: clipboardXBlock });
      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(true);
    });
  });
});
