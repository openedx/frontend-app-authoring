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

  test.each([
    {
      label: 'should handle failure to paste content',
      mockUrl: getLibraryPasteClipboardUrl(libraryId),
      mockResponse: undefined,
      expectedError: 'There was an error pasting the content.',
      buttonName: /paste from clipboard/i,
    },
    {
      label: 'should show detailed error in toast on paste failure',
      mockUrl: getLibraryPasteClipboardUrl(libraryId),
      mockResponse: ['library cannot have more than 100000 components'],
      expectedError: 'There was an error pasting the content: library cannot have more than 100000 components',
      buttonName: /paste from clipboard/i,
    },
    {
      label: 'should handle failure to create content',
      mockUrl: getCreateLibraryBlockUrl(libraryId),
      mockResponse: undefined,
      expectedError: 'There was an error creating the content.',
      buttonName: /text/i,
    },
    {
      label: 'should show detailed error in toast on create failure',
      mockUrl: getCreateLibraryBlockUrl(libraryId),
      mockResponse: 'library cannot have more than 100000 components',
      expectedError: 'There was an error creating the content: library cannot have more than 100000 components',
      buttonName: /text/i,
    },
  ])('$label', async ({
    mockUrl, mockResponse, buttonName, expectedError,
  }) => {
    const { axiosMock, mockShowToast } = initializeMocks();
    axiosMock.onPost(mockUrl).reply(400, mockResponse);

    // Simulate having an HTML block in the clipboard:
    mockClipboardHtml.applyMock();

    render();
    const button = await screen.findByRole('button', { name: buttonName });
    fireEvent.click(button);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
      expect(axiosMock.history.post[0].url).toEqual(mockUrl);
      expect(mockShowToast).toHaveBeenCalledWith(expectedError);
    });
  });
});
