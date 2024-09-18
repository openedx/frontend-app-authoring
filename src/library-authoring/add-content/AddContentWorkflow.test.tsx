/**
 * Test the whole workflow of adding content, editing it, saving it
 */
import { snakeCaseObject } from '@edx/frontend-platform';
import {
  fireEvent,
  render,
  waitFor,
  screen,
  initializeMocks,
} from '../../testUtils';
import mockResult from '../__mocks__/library-search.json';
import editorCmsApi from '../../editors/data/services/cms/api';
import * as textEditorHooks from '../../editors/containers/TextEditor/hooks';
import {
  mockContentLibrary,
  mockCreateLibraryBlock,
  mockLibraryBlockTypes,
  mockXBlockFields,
} from '../data/api.mocks';
import { mockBroadcastChannel, mockClipboardEmpty } from '../../generic/data/api.mock';
import { mockContentSearchConfig, mockSearchResult } from '../../search-manager/data/api.mock';
import LibraryLayout from '../LibraryLayout';

mockContentSearchConfig.applyMock();
mockLibraryBlockTypes.applyMock();
mockClipboardEmpty.applyMock();
mockBroadcastChannel();
mockContentLibrary.applyMock();
mockCreateLibraryBlock.applyMock();
mockSearchResult(mockResult);
// Mocking the redux APIs in the src/editors/ folder is a bit more involved:
jest.spyOn(editorCmsApi as any, 'fetchBlockById').mockImplementation(
  async (args: { blockId: string }) => (
    { status: 200, data: snakeCaseObject(await mockXBlockFields(args.blockId)) }
  ),
);
jest.spyOn(textEditorHooks, 'getContent').mockImplementation(() => () => '<p>Edited HTML content</p>');
jest.mock('frontend-components-tinymce-advanced-plugins', () => ({ a11ycheckerCss: '' }));

const { libraryId } = mockContentLibrary;
const renderOpts = {
  // Mount the <LibraryLayout /> on this route, to simulate how it's mounted in the real app:
  path: '/library/:libraryId/*',
  // And set the current URL to the following:
  routerProps: { initialEntries: [`/library/${libraryId}/components`] },
};

describe('AddContentWorkflow test', () => {
  it('can create an HTML component', async () => {
    initializeMocks();
    render(<LibraryLayout />, renderOpts);

    // Click "New [Component]"
    const newComponentButton = await screen.findByRole('button', { name: /New/ });
    fireEvent.click(newComponentButton);

    // Click "Text" to create a text component
    fireEvent.click(await screen.findByRole('button', { name: /Text/ }));

    // Then the editor should open
    expect(await screen.findByRole('heading', { name: /New Text Component/ })).toBeInTheDocument();

    // Edit the title
    fireEvent.click(screen.getByRole('button', { name: /Edit Title/ }));
    const titleInput = screen.getByPlaceholderText('Title');
    fireEvent.change(titleInput, { target: { value: 'A customized title' } });
    fireEvent.blur(titleInput);
    await waitFor(() => expect(screen.queryByRole('heading', { name: /New Text Component/ })).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: /A customized title/ }));

    // Note that TinyMCE doesn't really load properly in our test environment
    // so we can't really edit the text, but we have getContent() mocked to simulate
    // using TinyMCE to enter some new HTML.

    // Mock the save() REST API method:
    const saveSpy = jest.spyOn(editorCmsApi as any, 'saveBlock').mockImplementationOnce(async () => ({
      status: 200, data: { id: mockXBlockFields.usageKeyNewHtml },
    }));

    // Click Save
    const saveButton = screen.getByLabelText('Save changes and return to learning context');
    fireEvent.click(saveButton);
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it('can create a Problem component', async () => {
    initializeMocks();
    render(<LibraryLayout />, renderOpts);

    // Click "New [Component]"
    const newComponentButton = await screen.findByRole('button', { name: /New/ });
    fireEvent.click(newComponentButton);

    // Click "Problem" to create a capa problem component
    fireEvent.click(await screen.findByRole('button', { name: /Problem/ }));

    // Then the editor should open
    expect(await screen.findByRole('heading', { name: /Select problem type/ })).toBeInTheDocument();

    // Select the type: Numerical Input
    fireEvent.click(await screen.findByRole('button', { name: 'Numerical input' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select' }));

    expect(await screen.findByRole('heading', { name: /Numerical input/ })).toBeInTheDocument();

    // Enter an answer value:
    const inputA = await screen.findByPlaceholderText('Enter an answer');
    fireEvent.change(inputA, { target: { value: '123456' } });

    // Mock the save() REST API method:
    const saveSpy = jest.spyOn(editorCmsApi as any, 'saveBlock').mockImplementationOnce(async () => ({
      status: 200, data: { id: mockXBlockFields.usageKeyNewProblem },
    }));

    // Click Save
    const saveButton = screen.getByLabelText('Save changes and return to learning context');
    fireEvent.click(saveButton);
    expect(saveSpy).toHaveBeenCalledTimes(2); // TODO: why is this called twice?
  });

  it('can create a Video component', async () => {
    const { mockShowToast } = initializeMocks();
    render(<LibraryLayout />, renderOpts);

    // Click "New [Component]"
    const newComponentButton = await screen.findByRole('button', { name: /New/ });
    fireEvent.click(newComponentButton);

    // Pre-condition - the success toast is NOT shown yet:
    expect(mockShowToast).not.toHaveBeenCalled();

    // Click "Video" to create a video component
    fireEvent.click(await screen.findByRole('button', { name: /Video/ }));

    // We haven't yet implemented the video editor, so we expect only a toast to appear
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith('Content created successfully.'));
  });
});
