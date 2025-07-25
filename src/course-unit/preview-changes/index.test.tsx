import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter/types';
import {
  act,
  render as baseRender,
  screen,
  initializeMocks,
  waitFor,
} from '../../testUtils';

import IframePreviewLibraryXBlockChanges, { LibraryChangesMessageData } from '.';
import { messageTypes } from '../constants';
import { libraryBlockChangesUrl } from '../data/api';
import { ToastActionData } from '../../generic/toast-context';

const usageKey = 'some-id';
const defaultEventData: LibraryChangesMessageData = {
  displayName: 'Test block',
  downstreamBlockId: usageKey,
  upstreamBlockId: 'lct:org:lib1:unit:1',
  upstreamBlockVersionSynced: 1,
  isVertical: false,
};

const mockSendMessageToIframe = jest.fn();
jest.mock('../../generic/hooks/context/hooks', () => ({
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
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'New version' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Old version' })).toBeInTheDocument();
  });

  it('renders default displayName for units with no displayName', async () => {
    render({ ...defaultEventData, isVertical: true, displayName: '' });

    expect(await screen.findByText('Preview changes: Unit')).toBeInTheDocument();
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
});
