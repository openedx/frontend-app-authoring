import {
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import { mockContentLibrary } from '../data/api.mocks';
import { getCreateLibraryBlockUrl, getLibraryCollectionComponentApiUrl, getLibraryPasteClipboardUrl } from '../data/api';
import { mockBroadcastChannel, mockClipboardEmpty, mockClipboardHtml } from '../../generic/data/api.mock';
import { LibraryProvider } from '../common/context';
import AddContentContainer from './AddContentContainer';

mockBroadcastChannel();

const { libraryId } = mockContentLibrary;
const render = (collectionId?: string) => {
  const params: { libraryId: string, collectionId?: string } = { libraryId };
  if (collectionId) {
    params.collectionId = collectionId;
  }
  return baseRender(<AddContentContainer />, {
    path: '/library/:libraryId/*',
    params,
    extraWrapper: ({ children }) => (
      <LibraryProvider
        libraryId={libraryId}
        collectionId={collectionId}
      >{ children }
      </LibraryProvider>
    ),
  });
};

describe('<AddContentContainer />', () => {
  it('should render content buttons', () => {
    initializeMocks();
    mockClipboardEmpty.applyMock();
    render();
    expect(screen.queryByRole('button', { name: /collection/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /text/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /problem/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open reponse/i })).not.toBeInTheDocument(); // Excluded from MVP
    expect(screen.queryByRole('button', { name: /drag drop/i })).not.toBeInTheDocument(); // Excluded from MVP
    expect(screen.queryByRole('button', { name: /video/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /advanced \/ other/i })).not.toBeInTheDocument(); // Excluded from MVP
    expect(screen.queryByRole('button', { name: /copy from clipboard/i })).not.toBeInTheDocument();
  });

  it('should create a content', async () => {
    const { axiosMock } = initializeMocks();
    mockClipboardEmpty.applyMock();
    const url = getCreateLibraryBlockUrl(libraryId);
    axiosMock.onPost(url).reply(200);

    render();

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));
  });

  it('should create a content in a collection', async () => {
    const { axiosMock } = initializeMocks();
    mockClipboardEmpty.applyMock();
    const collectionId = 'some-collection-id';
    const url = getCreateLibraryBlockUrl(libraryId);
    const collectionComponentUrl = getLibraryCollectionComponentApiUrl(
      libraryId,
      collectionId,
    );
    axiosMock.onPost(url).reply(200, { id: 'some-component-id' });
    axiosMock.onPatch(collectionComponentUrl).reply(200);

    render(collectionId);

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(1));
    await waitFor(() => expect(axiosMock.history.patch[0].url).toEqual(collectionComponentUrl));
  });

  it('should render paste button if clipboard contains pastable xblock', async () => {
    initializeMocks();
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();
    render();
    expect(getClipboardSpy).toHaveBeenCalled(); // Hmm, this is getting called three times! Refactor to use react-query.
    await waitFor(() => expect(screen.queryByRole('button', { name: /paste from clipboard/i })).toBeInTheDocument());
  });

  it('should paste content', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    axiosMock.onPost(pasteUrl).reply(200);

    render();

    expect(getClipboardSpy).toHaveBeenCalled(); // Hmm, this is getting called four times! Refactor to use react-query.

    const pasteButton = await screen.findByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(pasteUrl));
  });

  it('should paste content inside a collection', async () => {
    const { axiosMock } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    const collectionId = 'some-collection-id';
    const collectionComponentUrl = getLibraryCollectionComponentApiUrl(
      libraryId,
      collectionId,
    );
    axiosMock.onPatch(collectionComponentUrl).reply(200);
    axiosMock.onPost(pasteUrl).reply(200, { id: 'some-component-id' });

    render(collectionId);

    expect(getClipboardSpy).toHaveBeenCalled(); // Hmm, this is getting called four times! Refactor to use react-query.

    const pasteButton = await screen.findByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(pasteUrl));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(1));
    await waitFor(() => expect(axiosMock.history.patch[0].url).toEqual(collectionComponentUrl));
  });

  it('should show error toast on linking failure', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    const collectionId = 'some-collection-id';
    const collectionComponentUrl = getLibraryCollectionComponentApiUrl(
      libraryId,
      collectionId,
    );
    axiosMock.onPatch(collectionComponentUrl).reply(500);
    axiosMock.onPost(pasteUrl).reply(200, { id: 'some-component-id' });

    render(collectionId);

    expect(getClipboardSpy).toHaveBeenCalled(); // Hmm, this is getting called four times! Refactor to use react-query.

    const pasteButton = await screen.findByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(pasteUrl));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(1));
    await waitFor(() => expect(axiosMock.history.patch[0].url).toEqual(collectionComponentUrl));
    expect(mockShowToast).toHaveBeenCalledWith('There was an error linking the content to this collection.');
  });

  it('should handle failure to paste content', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    axiosMock.onPost(pasteUrl).reply(400);

    render();

    const pasteButton = await screen.findByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toEqual(pasteUrl);
      expect(mockShowToast).toHaveBeenCalledWith('There was an error pasting the content.');
    });
  });

  it('should handle failure to paste content and show server error if available', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    mockClipboardHtml.applyMock();

    const errMsg = 'Libraries do not support this type of content yet.';
    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);

    // eslint-disable-next-line prefer-promise-reject-errors
    axiosMock.onPost(pasteUrl).reply(() => Promise.reject({
      customAttributes: {
        httpErrorStatus: 400,
        httpErrorResponseData: JSON.stringify({ block_type: errMsg }),
      },
    }));

    render();

    const pasteButton = await screen.findByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => {
      expect(axiosMock.history.post[0].url).toEqual(pasteUrl);
      expect(mockShowToast).toHaveBeenCalledWith(errMsg);
    });
  });

  it('should stop user from pasting unsupported blocks and show toast', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    // Simulate having an HTML block in the clipboard:
    mockClipboardHtml.applyMock('openassessment');

    const errMsg = 'Libraries do not support this type of content yet.';

    render();

    const pasteButton = await screen.findByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(0);
      expect(mockShowToast).toHaveBeenCalledWith(errMsg);
    });
  });
});
