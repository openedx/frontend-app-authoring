import MockAdapter from 'axios-mock-adapter/types';
import {
  fireEvent,
  render as baseRender,
  screen,
  waitFor,
  initializeMocks,
} from '../../testUtils';
import {
  mockContentLibrary,
  mockBlockTypesMetadata,
  mockXBlockFields,
} from '../data/api.mocks';
import {
  getContentLibraryApiUrl,
  getCreateLibraryBlockUrl,
  getLibraryCollectionItemsApiUrl,
  getLibraryContainerChildrenApiUrl,
  getLibraryPasteClipboardUrl,
  getXBlockFieldsApiUrl,
} from '../data/api';
import { mockClipboardEmpty, mockClipboardHtml } from '../../generic/data/api.mock';
import { LibraryProvider } from '../common/context/LibraryContext';
import AddContent from './AddContent';
import { ComponentEditorModal } from '../components/ComponentEditorModal';
import editorCmsApi from '../../editors/data/services/cms/api';
import { ToastActionData } from '../../generic/toast-context';
import * as textEditorHooks from '../../editors/containers/TextEditor/hooks';

// mockCreateLibraryBlock.applyMock();

// Mocks for ComponentEditorModal to work in tests.
jest.mock('frontend-components-tinymce-advanced-plugins', () => ({ a11ycheckerCss: '' }));

const { libraryId } = mockContentLibrary;
const render = (collectionId?: string) => {
  const params: { libraryId: string, collectionId?: string } = { libraryId, collectionId };
  return baseRender(<AddContent />, {
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
const renderWithUnit = (unitId: string) => {
  const params: { libraryId: string, unitId?: string } = { libraryId, unitId };
  return baseRender(<AddContent />, {
    path: '/library/:libraryId/:unitId?',
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

describe('<AddContent />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    axiosMock.onGet(getContentLibraryApiUrl(libraryId)).reply(200, {});
    jest.spyOn(textEditorHooks, 'getContent').mockImplementation(() => () => '<p>Edited HTML content</p>');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should render content buttons', async () => {
    mockBlockTypesMetadata.applyMock();
    mockClipboardEmpty.applyMock();
    render();
    expect(screen.queryByRole('button', { name: /collection/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /text/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /problem/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open reponse/i })).toBeInTheDocument(); // Excluded from MVP
    expect(screen.queryByRole('button', { name: /drag drop/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /video/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy from clipboard/i })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /advanced \/ other/i })).toBeInTheDocument();
  });

  it('should render advanced content buttons', async () => {
    mockBlockTypesMetadata.applyMock();
    mockClipboardEmpty.applyMock();
    render();

    const advancedButton = await screen.findByRole('button', { name: /advanced \/ other/i });
    fireEvent.click(advancedButton);

    expect(await screen.findByRole('button', { name: /poll/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /survey/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /google document/i })).toBeInTheDocument();
  });

  it('should return to content view fron advanced block creation view', async () => {
    mockBlockTypesMetadata.applyMock();
    mockClipboardEmpty.applyMock();
    render();

    const advancedButton = await screen.findByRole('button', { name: /advanced \/ other/i });
    fireEvent.click(advancedButton);

    expect(await screen.findByRole('button', { name: /poll/i })).toBeInTheDocument();

    const returnButton = screen.getByRole('button', { name: /back to list/i });
    fireEvent.click(returnButton);

    expect(screen.queryByRole('button', { name: /text/i })).toBeInTheDocument();
  });

  it('should create an advanced content', async () => {
    mockBlockTypesMetadata.applyMock();
    mockClipboardEmpty.applyMock();
    const url = getCreateLibraryBlockUrl(libraryId);
    axiosMock.onPost(url).reply(200);
    render();

    const advancedButton = await screen.findByRole('button', { name: /advanced \/ other/i });
    fireEvent.click(advancedButton);

    const surveyButton = await screen.findByRole('button', { name: /survey/i });
    fireEvent.click(surveyButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(url));
    await waitFor(() => expect(axiosMock.history.patch.length).toEqual(0));
  });

  it('should open the editor modal to create a content when the block is supported', async () => {
    mockClipboardEmpty.applyMock();
    const url = getCreateLibraryBlockUrl(libraryId);
    axiosMock.onPost(url).reply(200);

    render();

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);
    expect(await screen.findByRole('heading', { name: /Text/ })).toBeInTheDocument();
  });

  it('should create a content in a collection for editable blocks', async () => {
    mockClipboardEmpty.applyMock();
    const collectionId = 'some-collection-id';
    const url = getCreateLibraryBlockUrl(libraryId);
    const usageKey = mockXBlockFields.usageKeyNewHtml;
    const updateBlockUrl = getXBlockFieldsApiUrl(usageKey);
    const collectionComponentUrl = getLibraryCollectionItemsApiUrl(
      libraryId,
      collectionId,
    );
    // Mocks for ComponentEditorModal to work in tests.
    jest.spyOn(editorCmsApi, 'fetchCourseImages').mockImplementation(async () => ( // eslint-disable-next-line
      { data: { assets: [], start: 0, end: 0, page: 0, pageSize: 50, totalCount: 0 } }
    ));
    axiosMock.onPost(url).reply(200, {
      id: usageKey,
    });

    axiosMock.onPost(updateBlockUrl).reply(200, mockXBlockFields.dataHtml);
    axiosMock.onPatch(collectionComponentUrl).reply(200);
    render(collectionId);

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    // Component should be linked to Collection on saving the changes in the editor.
    const saveButton = screen.getByLabelText('Save changes and return to learning context');
    fireEvent.click(saveButton);
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

  it('should show error toast on paste failure', async () => {
    // Simulate having an HTML block in the clipboard:
    mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    axiosMock.onPost(pasteUrl).reply(500, { block_type: 'Unsupported block type.' });

    render();
    const pasteButton = await screen.findByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteButton);

    await waitFor(() => expect(axiosMock.history.post[0].url).toEqual(pasteUrl));
    expect(mockShowToast).toHaveBeenCalledWith(
      'There was an error pasting the content: {"block_type":"Unsupported block type."}',
    );
  });

  it('should paste content inside a collection', async () => {
    // Simulate having an HTML block in the clipboard:
    const getClipboardSpy = mockClipboardHtml.applyMock();

    const pasteUrl = getLibraryPasteClipboardUrl(libraryId);
    const collectionId = 'some-collection-id';
    const collectionComponentUrl = getLibraryCollectionItemsApiUrl(
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
    const collectionComponentUrl = getLibraryCollectionItemsApiUrl(
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
    expect(mockShowToast).toHaveBeenCalledWith('Failed to add content to collection.');
  });

  it('should stop user from pasting unsupported blocks and show toast', async () => {
    // Simulate having an HTML block in the clipboard:
    mockClipboardHtml.applyMock('conditional');

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

  it('should not show collection/unit buttons when create component in container', async () => {
    const unitId = 'lct:orf1:lib1:unit:test-1';
    renderWithUnit(unitId);

    expect(await screen.findByRole('button', { name: 'Text' })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Collection' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unit' })).not.toBeInTheDocument();
  });

  it('should create a component in unit', async () => {
    const unitId = 'lct:orf1:lib1:unit:test-1';
    const usageKey = mockXBlockFields.usageKeyNewHtml;
    const createUrl = getCreateLibraryBlockUrl(libraryId);
    const updateBlockUrl = getXBlockFieldsApiUrl(usageKey);
    const linkUrl = getLibraryContainerChildrenApiUrl(unitId);

    axiosMock.onPost(createUrl).reply(200, {
      id: usageKey,
    });
    axiosMock.onPost(updateBlockUrl).reply(200, mockXBlockFields.dataHtml);
    axiosMock.onPost(linkUrl).reply(200);

    renderWithUnit(unitId);

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    // Component should be linked to Unit on saving the changes in the editor.
    const saveButton = screen.getByLabelText('Save changes and return to learning context');
    fireEvent.click(saveButton);

    await waitFor(() => expect(axiosMock.history.post.length).toEqual(3));
    expect(axiosMock.history.post[0].url).toEqual(createUrl);
    expect(axiosMock.history.post[1].url).toEqual(updateBlockUrl);
    expect(axiosMock.history.post[2].url).toEqual(linkUrl);
  });

  it('should show error on create a component in unit', async () => {
    const unitId = 'lct:orf1:lib1:unit:test-1';
    const usageKey = mockXBlockFields.usageKeyNewHtml;
    const createUrl = getCreateLibraryBlockUrl(libraryId);
    const updateBlockUrl = getXBlockFieldsApiUrl(usageKey);
    const linkUrl = getLibraryContainerChildrenApiUrl(unitId);

    axiosMock.onPost(createUrl).reply(200, {
      id: usageKey,
    });
    axiosMock.onPost(updateBlockUrl).reply(200, mockXBlockFields.dataHtml);
    axiosMock.onPost(linkUrl).reply(400);

    renderWithUnit(unitId);

    const textButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textButton);

    const saveButton = screen.getByLabelText('Save changes and return to learning context');
    fireEvent.click(saveButton);

    await waitFor(() => expect(axiosMock.history.post.length).toEqual(3));
    expect(axiosMock.history.post[0].url).toEqual(createUrl);
    expect(axiosMock.history.post[1].url).toEqual(updateBlockUrl);
    expect(axiosMock.history.post[2].url).toEqual(linkUrl);

    expect(mockShowToast).toHaveBeenCalledWith('There was an error linking the content to this container.');
  });
});
