import {
  fireEvent,
  initializeMocks,
  render as baseRender,
  screen,
  waitFor,
} from '../../testUtils';
import {
  mockContentLibrary,
  mockLibraryBlockMetadata,
  mockSetXBlockOLX,
  mockXBlockAssets,
  mockXBlockOLX,
} from '../data/api.mocks';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
import * as apiHooks from '../data/apiHooks';
import { ComponentAdvancedInfo } from './ComponentAdvancedInfo';
import { getXBlockAssetsApiUrl } from '../data/api';

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockXBlockAssets.applyMock();
mockXBlockOLX.applyMock();
const setOLXspy = mockSetXBlockOLX.applyMock();

const render = (
  usageKey: string = mockLibraryBlockMetadata.usageKeyPublished,
  libraryId: string = mockContentLibrary.libraryId,
  showOnlyPublished: boolean = false,
) => baseRender(
  <ComponentAdvancedInfo />,
  {
    extraWrapper: ({ children }: { children: React.ReactNode }) => (
      <LibraryProvider libraryId={libraryId} showOnlyPublished={showOnlyPublished}>
        <SidebarProvider
          initialSidebarComponentInfo={{
            id: usageKey,
            type: SidebarBodyComponentId.ComponentInfo,
          }}
        >
          {children}
        </SidebarProvider>
      </LibraryProvider>
    ),
  },
);

describe('<ComponentAdvancedInfo />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('should display nothing when collapsed', async () => {
    render();
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    expect(expandButton).toBeInTheDocument();
    expect(screen.queryByText(mockLibraryBlockMetadata.usageKeyPublished)).not.toBeInTheDocument();
  });

  it('should display the usage key of the block (when expanded)', async () => {
    render();
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    expect(await screen.findByText(mockLibraryBlockMetadata.usageKeyPublished)).toBeInTheDocument();
  });

  it('should display the static assets of the block (when expanded)', async () => {
    render();
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    expect(await screen.findByText(/static\/image1\.png/)).toBeInTheDocument();
    expect(await screen.findByText(/\(12M\)/)).toBeInTheDocument(); // size of the above file
    expect(await screen.findByText(/static\/data\.csv/)).toBeInTheDocument();
    expect(await screen.findByText(/\(8K\)/)).toBeInTheDocument(); // size of the above file
    expect(await screen.findByText(/Drag and drop your file here or click to upload/)).toBeInTheDocument();
  });

  it('should delete static assets of the block', async () => {
    const { axiosMock } = initializeMocks();

    render();

    const url = `${getXBlockAssetsApiUrl(mockLibraryBlockMetadata.usageKeyPublished)}${encodeURIComponent('static/image1.png')}`;
    axiosMock.onDelete(url).reply(200);

    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);

    expect(await screen.findByText(/static\/image1\.png/)).toBeInTheDocument();

    // Click on delete button
    const deleteButtons = await screen.findAllByTitle('Delete this file');
    expect(deleteButtons.length).toEqual(2);
    fireEvent.click(deleteButtons[0]);

    // Show the pop up and click on delete
    expect(await screen.findByText(/Are you sure you want to delete static\/image1\.png/)).toBeInTheDocument();
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete[0].url).toEqual(url));
  });

  it('should add asset in Dropzone', async () => {
    const { axiosMock } = initializeMocks();
    render();

    const url = `${getXBlockAssetsApiUrl(mockLibraryBlockMetadata.usageKeyPublished)}static/image3.png`;
    axiosMock.onPut(url).reply(200);

    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);

    const dropzone = await screen.findByText(/Drag and drop your file here or click to upload/);
    expect(dropzone).toBeInTheDocument();

    const file = new File(['file'], 'image3.png', {
      type: 'image/png',
    });
    Object.defineProperty(dropzone, 'files', {
      value: [file],
    });

    fireEvent.drop(dropzone);

    await waitFor(() => expect(axiosMock.history.put[0].url).toEqual(url));
  });

  it('should display the OLX source of the block (when expanded)', async () => {
    const usageKey = mockXBlockOLX.usageKeyHtml;
    const spy = jest.spyOn(apiHooks, 'useXBlockOLX');

    render(mockXBlockOLX.usageKeyHtml);
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    // Because of syntax highlighting, the OLX will be broken up by many different tags so we need to search for
    // just a substring:
    const olxPart = /This is a text component which uses/;
    await waitFor(() => expect(screen.getByText(olxPart)).toBeInTheDocument());
    expect(spy).toHaveBeenCalledWith(usageKey, 'draft');
  });

  it('should display the published OLX source of the block (when expanded)', async () => {
    const usageKey = mockXBlockOLX.usageKeyHtml;
    const spy = jest.spyOn(apiHooks, 'useXBlockOLX');

    render(usageKey, undefined, true);
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    // Because of syntax highlighting, the OLX will be broken up by many different tags so we need to search for
    // just a substring:
    const olxPart = /This is a text component which uses/;
    await waitFor(() => expect(screen.getByText(olxPart)).toBeInTheDocument());
    expect(spy).toHaveBeenCalledWith(usageKey, 'published');
  });

  it('does not display "Edit OLX" button and assets dropzone when the library is read-only', async () => {
    render(mockXBlockOLX.usageKeyHtml, mockContentLibrary.libraryIdReadOnly);
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    expect(screen.queryByRole('button', { name: /Edit OLX/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Drag and drop your file here or click to upload/)).not.toBeInTheDocument();
  });

  it('can edit the OLX', async () => {
    render();
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    const editButton = await screen.findByRole('button', { name: /Edit OLX/ });
    fireEvent.click(editButton);

    expect(setOLXspy).not.toHaveBeenCalled();

    const saveButton = await screen.findByRole('button', { name: /Save/ });
    fireEvent.click(saveButton);

    await waitFor(() => expect(setOLXspy).toHaveBeenCalled());
  });

  it('displays an error if editing the OLX failed', async () => {
    setOLXspy.mockImplementation(async () => {
      throw new Error('Example error - setting OLX failed');
    });

    render(mockLibraryBlockMetadata.usageKeyPublished);
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    const editButton = await screen.findByRole('button', { name: /Edit OLX/ });
    fireEvent.click(editButton);
    const saveButton = await screen.findByRole('button', { name: /Save/ });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/An error occurred and the OLX could not be saved./)).toBeInTheDocument();
  });
});
