import { renderHook } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import {
  clipboardSubsection,
  clipboardUnit,
  clipboardXBlock,
} from '../../../__mocks__';
import { initializeMocks, makeWrapper } from '../../../testUtils';
import { getClipboardUrl } from '../../data/api';
import useClipboard, { _testingOverrideBroadcastChannel } from './useClipboard';

initializeMocks();

let axiosMock: MockAdapter;
let mockShowToast: jest.Mock;

const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const xblockId = 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4';

let broadcastMockListener: (x: unknown) => void | undefined;
const clipboardBroadcastChannelMock = {
  postMessage: (message: unknown) => { broadcastMockListener(message); },
  addEventListener: (_eventName: string, handler: typeof broadcastMockListener) => { broadcastMockListener = handler; },
  removeEventListener: jest.fn(),
};
_testingOverrideBroadcastChannel(clipboardBroadcastChannelMock as any);

describe('useClipboard', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast as jest.Mock;
  });

  afterEach(() => {
    axiosMock.restore();
  });

  describe('clipboard data update effect', () => {
    it('returns falsy flags if canEdit = false', async () => {
      const { result, rerender } = renderHook(() => useClipboard(false), { wrapper: makeWrapper() });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardSubsection);

      await result.current.copyToClipboard(unitId);

      rerender();

      expect(mockShowToast).toHaveBeenCalledWith('Copying');
      expect(mockShowToast).toHaveBeenCalledWith('Copied to clipboard');

      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(false);
    });

    it('returns flag to display the Paste Unit button', async () => {
      const { result, rerender } = renderHook(() => useClipboard(true), { wrapper: makeWrapper() });

      axiosMock
        .onPost(getClipboardUrl())
        .reply(200, clipboardUnit);

      await result.current.copyToClipboard(unitId);

      rerender();

      expect(result.current.showPasteUnit).toBe(true);
      expect(result.current.showPasteXBlock).toBe(false);
    });

    it('returns flag to display the Paste XBlock button', async () => {
      const { result, rerender } = renderHook(() => useClipboard(true), { wrapper: makeWrapper() });

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
      const { result, rerender } = renderHook(() => useClipboard(true), { wrapper: makeWrapper() });
      // Subsections cannot be pasted:
      clipboardBroadcastChannelMock.postMessage({ data: clipboardUnit });

      rerender();

      expect(result.current.showPasteUnit).toBe(true);
      expect(result.current.showPasteXBlock).toBe(false);

      clipboardBroadcastChannelMock.postMessage({ data: clipboardXBlock });
      rerender();

      expect(result.current.showPasteUnit).toBe(false);
      expect(result.current.showPasteXBlock).toBe(true);
    });
  });

  it('shows the current status while copying to clipboard', async () => {
    const { result, rerender } = renderHook(() => useClipboard(true), { wrapper: makeWrapper() });

    axiosMock
      .onPost(getClipboardUrl())
      .networkError();

    await result.current.copyToClipboard(unitId);

    rerender();

    expect(mockShowToast).toHaveBeenCalledWith('Error copying to clipboard');
  });
});
