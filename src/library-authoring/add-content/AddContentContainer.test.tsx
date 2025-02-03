import MockAdapter from 'axios-mock-adapter/types';
import { snakeCaseObject } from '@edx/frontend-platform';
import {
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import { mockContentLibrary } from '../data/api.mocks';
import {
  getContentLibraryApiUrl, getCreateLibraryBlockUrl, getLibraryCollectionComponentApiUrl, getLibraryPasteClipboardUrl,
} from '../data/api';
import { mockBroadcastChannel, mockClipboardEmpty, mockClipboardHtml } from '../../generic/data/api.mock';
import { LibraryProvider } from '../common/context/LibraryContext';
import AddContentContainer from './AddContentContainer';
import { ComponentEditorModal } from '../components/ComponentEditorModal';
import editorCmsApi from '../../editors/data/services/cms/api';
import { ToastActionData } from '../../generic/toast-context';

mockBroadcastChannel();

// Mocks for ComponentEditorModal to work in tests.
jest.mock('frontend-components-tinymce-advanced-plugins', () => ({ a11ycheckerCss: '' }));

const { libraryId } = mockContentLibrary;
const render = (collectionId?: string) => {
  const params: { libraryId: string, collectionId?: string } = { libraryId, collectionId };
  return baseRender(<AddContentContainer />, {
    path: '/library/:libraryId/:collectionId?',
    params,
    extraWrapper: ({ children }) => (
      <LibraryProvider
        libraryId={libraryId}
      >
        { children }
        <ComponentEditorModal />
      </LibraryProvider>
    ),
  });
};
let axiosMock: MockAdapter;
let mockShowToast: (message: string, action?: ToastActionData | undefined) => void;

describe('<AddContentContainer />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    axiosMock.onGet(getContentLibraryApiUrl(libraryId)).reply(200, {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should render content buttons', () => {
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
    mockClipboardEmpty.applyMock();
    const url = getCreateLibraryBlockUrl(libraryId);
    axiosMock.onPost(url).reply(200);

    render();

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));
  });

  it('should create a content in a collection for non-editable blocks', async () => {
    mockClipboardEmpty.applyMock();
    const collectionId = 'some-collection-id';
    const url = getCreateLibraryBlockUrl(libraryId);
    const collectionComponentUrl = getLibraryCollectionComponentApiUrl(
      libraryId,
      collectionId,
    );
    // having id of block which is not video, html or problem will not trigger editor.
    axiosMock.onPost(url).reply(200, { id: 'some-component-id' });
    axiosMock.onPatch(collectionComponentUrl).reply(200);

    render(collectionId);

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(1));
    await waitFor(() => expect(axiosMock.history.patch[0].url).toEqual(collectionComponentUrl));
  });

  it('should create a content in a collection for editable blocks', async () => {
    mockClipboardEmpty.applyMock();
    const collectionId = 'some-collection-id';
    const url = getCreateLibraryBlockUrl(libraryId);
    const collectionComponentUrl = getLibraryCollectionComponentApiUrl(
      libraryId,
      collectionId,
    );
    // Mocks for ComponentEditorModal to work in tests.
    jest.spyOn(editorCmsApi, 'fetchCourseImages').mockImplementation(async () => ( // eslint-disable-next-line
      { data: { assets: [], start: 0, end: 0, page: 0, pageSize: 50, totalCount: 0 } }
    ));
    jest.spyOn(editorCmsApi, 'fetchByUnitId').mockImplementation(async () => ({
      status: 200,
      data: {
        ancestors: [{
          id: 'block-v1:Org+TS100+24+type@vertical+block@parent',
          display_name: 'You-Knit? The Test Unit',
          category: 'vertical',
          has_children: true,
        }],
      },
    }));

    axiosMock.onPost(url).reply(200, {
      id: 'lb:OpenedX:CSPROB2:html:1a5efd56-4ee5-4df0-b466-44f08fbbf567',
    });
    const fieldsHtml = {
      displayName: 'Introduction to Testing',
      data: '<p>This is a text component which uses <strong>HTML</strong>.</p>',
      metadata: { displayName: 'Introduction to Testing' },
    };
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => (
      { status: 200, data: snakeCaseObject(fieldsHtml) }
    ));
    axiosMock.onPatch(collectionComponentUrl).reply(200);

    render(collectionId);

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    // Component should be linked to Collection on closing editor.
    const closeButton = await screen.findByRole('button', { name: 'Exit the editor' });
    fireEvent.click(closeButton);
    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(1));
    await waitFor(() => expect(axiosMock.history.patch[0].url).toEqual(collectionComponentUrl));
  });

  it('should render paste button if clipboard contains pastable xblock', async () => {
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();
    render();
    expect(getClipboardSpy).toHaveBeenCalled(); // Hmm, this is getting called three times! Refactor to use react-query.
    await waitFor(() => expect(screen.queryByRole('button', { name: /paste from clipboard/i })).toBeInTheDocument());
  });

  it('should paste content', async () => {
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
