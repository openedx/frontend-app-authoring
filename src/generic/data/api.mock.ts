/* istanbul ignore file */
import * as api from './api';

/**
 * Mock for `getClipboard()` that simulates an empty clipboard
 */
export async function mockClipboardEmpty(): Promise<api.ClipboardStatus> {
  return {
    content: null,
    sourceUsageKey: '',
    sourceContextTitle: '',
    sourceEditUrl: '',
  };
}
mockClipboardEmpty.applyMock = () => jest.spyOn(api, 'getClipboard').mockImplementation(mockClipboardEmpty);
mockClipboardEmpty.applyMockOnce = () => jest.spyOn(api, 'getClipboard').mockImplementationOnce(mockClipboardEmpty);

/**
 * Mock for `getClipboard()` that simulates a copied HTML component
 */
export async function mockClipboardHtml(blockType?: string): Promise<api.ClipboardStatus> {
  return {
    content: {
      id: 69,
      userId: 3,
      created: '2024-01-16T13:33:21.314439Z',
      purpose: 'clipboard',
      status: 'ready',
      blockType: blockType || 'html',
      blockTypeDisplay: 'Text',
      olxUrl: 'http://localhost:18010/api/content-staging/v1/staged-content/69/olx',
      displayName: 'Blank HTML Page',
    },
    sourceUsageKey: 'block-v1:edX+DemoX+Demo_Course+type@html+block@html1',
    sourceContextTitle: 'Demonstration Course',
    sourceEditUrl: 'http://localhost:18010/container/block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical1',
  };
}
mockClipboardHtml.applyMock = (blockType?: string) => jest.spyOn(api, 'getClipboard').mockImplementation(() => mockClipboardHtml(blockType));
mockClipboardHtml.applyMockOnce = () => jest.spyOn(api, 'getClipboard').mockImplementationOnce(mockClipboardHtml);

/** Mock the DOM `BroadcastChannel` API which the clipboard code uses */
export function mockBroadcastChannel() {
  const clipboardBroadcastChannelMock = {
    postMessage: jest.fn(),
    close: jest.fn(),
  };
  (global as any).BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);
}
