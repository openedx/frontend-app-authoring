import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter/types';

import {
  act,
  render as baseRender,
  screen,
  initializeMocks,
  waitFor,
} from '@src/testUtils';
import { ToastActionData } from '@src/generic/toast-context';

import IframePreviewLibraryXBlockChanges, { LibraryChangesMessageData } from '.';
import { messageTypes } from '../constants';
import { libraryBlockChangesUrl } from '../data/api';

const usageKey = 'block-v1:UNIX+UX1+2025_T3+type@unit+block@1';
const defaultEventData: LibraryChangesMessageData = {
  displayName: 'Test block',
  downstreamBlockId: usageKey,
  upstreamBlockId: 'lct:org:lib1:unit:1',
  upstreamBlockVersionSynced: 1,
  isContainer: false,
  isLocallyModified: false,
  blockType: 'html',
};

const mockSendMessageToIframe = jest.fn();
jest.mock('@src/generic/hooks/context/hooks', () => ({
  useIframe: () => ({
    iframeRef: { current: { contentWindow: {} as HTMLIFrameElement } },
    setIframeRef: () => {},
    sendMessageToIframe: mockSendMessageToIframe,
  }),
}));
const render = (eventData?: LibraryChangesMessageData) => {
  baseRender(<IframePreviewLibraryXBlockChanges />);
  const message = {
    data: {
      type: messageTypes.showXBlockLibraryChangesPreview,
      payload: eventData || defaultEventData,
    },
  };
  // Dispatch showXBlockLibraryChangesPreview message event to open the preivew modal.
  act(() => {
    window.dispatchEvent(new MessageEvent('message', message));
  });
};

let axiosMock: MockAdapter;
let mockShowToast: (message: string, action?: ToastActionData | undefined) => void;

describe('<IframePreviewLibraryXBlockChanges />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
  });

  it('renders modal', async () => {
    render();

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Accept changes' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Ignore changes' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'New version' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Old version' })).toBeInTheDocument();
  });

  it('renders default displayName for units with no displayName', async () => {
    render({ ...defaultEventData, isContainer: true, displayName: '' });

    expect(await screen.findByText('Preview changes: Container')).toBeInTheDocument();
  });

  it('renders default displayName for components with no displayName', async () => {
    render({ ...defaultEventData, displayName: '' });

    expect(await screen.findByText('Preview changes: Component')).toBeInTheDocument();
  });

  it('accept changes works', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    render();

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();
    const acceptBtn = await screen.findByRole('button', { name: 'Accept changes' });
    await user.click(acceptBtn);
    await waitFor(() => {
      expect(mockSendMessageToIframe).toHaveBeenCalledWith(
        messageTypes.completeXBlockEditing,
        { locator: usageKey },
      );
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    });
    expect(screen.queryByText('Preview changes: Test block')).not.toBeInTheDocument();
  });

  it('shows toast if accept changes fails', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(500, {});
    render();

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();
    const acceptBtn = await screen.findByRole('button', { name: 'Accept changes' });
    await user.click(acceptBtn);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    });
    expect(screen.queryByText('Preview changes: Test block')).not.toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith('Failed to update component');
  });

  it('ignore changes works', async () => {
    const user = userEvent.setup();
    axiosMock.onDelete(libraryBlockChangesUrl(usageKey)).reply(200, {});
    render();

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();
    const ignoreBtn = await screen.findByRole('button', { name: 'Ignore changes' });
    await user.click(ignoreBtn);
    const ignoreConfirmBtn = await screen.findByRole('button', { name: 'Ignore' });
    await user.click(ignoreConfirmBtn);
    await waitFor(() => {
      expect(mockSendMessageToIframe).toHaveBeenCalledWith(
        messageTypes.completeXBlockEditing,
        { locator: usageKey },
      );
      expect(axiosMock.history.delete.length).toEqual(1);
      expect(axiosMock.history.delete[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    });
    expect(screen.queryByText('Preview changes: Test block')).not.toBeInTheDocument();
  });

  it('should render modal of text with local changes', async () => {
    render({ ...defaultEventData, isLocallyModified: true });

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();

    expect(screen.getByText('This library content has local edits.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Update to published library content' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Keep course content' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Course content' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Published library content' })).toBeInTheDocument();
  });

  it('update changes works', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    render({ ...defaultEventData, isLocallyModified: true });

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();
    const acceptBtn = await screen.findByRole('button', { name: 'Update to published library content' });
    await user.click(acceptBtn);
    const confirmBtn = await screen.findByRole('button', { name: 'Discard local edits and update' });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockSendMessageToIframe).toHaveBeenCalledWith(
        messageTypes.completeXBlockEditing,
        { locator: usageKey },
      );
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    });
    expect(screen.queryByText('Preview changes: Test block')).not.toBeInTheDocument();
  });

  it('keep changes work', async () => {
    const user = userEvent.setup();
    axiosMock.onDelete(libraryBlockChangesUrl(usageKey)).reply(200, {});
    render({ ...defaultEventData, isLocallyModified: true });

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();
    const ignoreBtn = await screen.findByRole('button', { name: 'Keep course content' });
    await user.click(ignoreBtn);
    const ignoreConfirmBtn = (await screen.findAllByRole('button', { name: 'Keep course content' }))[0];
    await user.click(ignoreConfirmBtn);
    await waitFor(() => {
      expect(mockSendMessageToIframe).toHaveBeenCalledWith(
        messageTypes.completeXBlockEditing,
        { locator: usageKey },
      );
      expect(axiosMock.history.delete.length).toEqual(1);
      expect(axiosMock.history.delete[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    });
    expect(screen.queryByText('Preview changes: Test block')).not.toBeInTheDocument();
  });
});
