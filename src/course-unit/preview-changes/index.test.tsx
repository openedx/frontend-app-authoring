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
import { validateUserPermissions } from '@src/authz/data/api';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';

import IframePreviewLibraryXBlockChanges, { PreviewLibraryXBlockChanges, LibraryChangesMessageData } from '.';
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
const render = async (eventData?: LibraryChangesMessageData) => {
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
  // The actions are read-only until the permissions are loaded, so wait for them before interacting.
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /^(Ignore changes|Keep course content)$/ })).toBeEnabled();
  });
};

let axiosMock: MockAdapter;
let mockShowToast: (message: string, action?: ToastActionData) => void;
let validateUserPermissionsMock: jest.SpiedFunction<typeof validateUserPermissions>;

const mockPermissions = (overrides = {}) =>
  validateUserPermissionsMock.mockResolvedValue({
    canManageLibraryUpdates: true,
    ...overrides,
  });

describe('<IframePreviewLibraryXBlockChanges />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    mockPermissions();
  });

  it('renders modal', async () => {
    await render();

    expect(await screen.findByText('Preview changes: Test block')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Accept changes' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Ignore changes' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'New version' })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Old version' })).toBeInTheDocument();
  });

  it('disables accept and ignore changes buttons with read-only tooltip when user lacks manage permission', async () => {
    mockPermissions({ canManageLibraryUpdates: false });

    const user = userEvent.setup();
    baseRender(
      <PreviewLibraryXBlockChanges
        blockData={defaultEventData}
        isModalOpen
        closeModal={jest.fn()}
        postChange={jest.fn()}
      />,
    );

    const acceptBtn = await screen.findByRole('button', { name: 'Accept changes' });
    expect(acceptBtn).toHaveAttribute('aria-disabled', 'true');
    const ignoreBtn = await screen.findByRole('button', { name: 'Ignore changes' });
    expect(ignoreBtn).toBeDisabled();

    await user.hover(acceptBtn.closest('span') ?? acceptBtn);
    expect(
      await screen.findByText(
        'Your role doesn\'t include permission to do this. Contact your org admin to request access',
      ),
    ).toBeInTheDocument();
  });

  it('renders default displayName for units with no displayName', async () => {
    await render({ ...defaultEventData, isContainer: true, displayName: '' });

    expect(await screen.findByText('Preview changes: Container')).toBeInTheDocument();
  });

  it('renders default displayName for components with no displayName', async () => {
    await render({ ...defaultEventData, displayName: '' });

    expect(await screen.findByText('Preview changes: Component')).toBeInTheDocument();
  });

  it('accept changes works', async () => {
    const user = userEvent.setup();
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    await render();

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
    await render();

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
    await render();

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
    await render({ ...defaultEventData, isLocallyModified: true });

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
    await render({ ...defaultEventData, isLocallyModified: true });

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
    await render({ ...defaultEventData, isLocallyModified: true });

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
