import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { mockContentSearchConfig, mockFetchIndexDocuments } from '@src/search-manager/data/api.mock';

import {
  mockContentLibrary,
  mockLibraryBlockMetadata,
  mockGetEntityLinks,
  mockGetComponentHierarchy,
} from '../data/api.mocks';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyItemId, SidebarProvider } from '../common/context/SidebarContext';
import ComponentInfo from './ComponentInfo';
import { getXBlockPublishApiUrl } from '../data/api';

mockContentSearchConfig.applyMock();
mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockGetEntityLinks.applyMock();
mockFetchIndexDocuments.applyMock();
mockGetComponentHierarchy.applyMock();
jest.mock('./ComponentPreview', () => ({
  __esModule: true, // Required when mocking 'default' export
  default: () => <div>Mocked preview</div>,
}));
jest.mock('./ComponentManagement', () => ({
  __esModule: true, // Required when mocking 'default' export
  default: () => <div>Mocked management tab</div>,
}));

const withLibraryId = (libraryId: string, sidebarComponentUsageKey: string) => ({
  extraWrapper: ({ children }: { children: React.ReactNode }) => (
    <LibraryProvider libraryId={libraryId}>
      <SidebarProvider
        initialSidebarItemInfo={{
          id: sidebarComponentUsageKey,
          type: SidebarBodyItemId.ComponentInfo,
        }}
      >
        {children}
      </SidebarProvider>
    </LibraryProvider>
  ),
});

describe('<ComponentInfo> Sidebar', () => {
  it('should show a disabled "Edit" button when the component type is not editable', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyUnsupportedXBlock),
    );

    const editButton = await screen.findByRole('button', { name: /Edit component/ });
    expect(editButton).toBeDisabled();
  });

  it('should not show a "Edit" button when the library is read-only', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryIdReadOnly, mockLibraryBlockMetadata.usageKeyPublished),
    );

    expect(screen.queryByRole('button', { name: /Edit component/ })).not.toBeInTheDocument();
  });

  it('should show a working "Edit" button for a normal component', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyPublished),
    );

    const editButton = await screen.findByRole('button', { name: /Edit component/ });
    await waitFor(() => expect(editButton).not.toBeDisabled());
  });

  it('should show a "Published" chip when the component is already published', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyPublishDisabled),
    );
    expect(await screen.findByText(/Published/)).toBeInTheDocument();
  });

  it('should show a working "Publish Changes" button when the component is not published', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyNeverPublished),
    );
    const publishButton = await screen.findByRole('button', { name: /Publish Changes/ });
    await waitFor(() => expect(publishButton).not.toBeDisabled());
  });

  it('should show the confirmation box', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyNeverPublished),
    );
    const publishButton = await screen.findByRole('button', { name: /Publish Changes/ });
    const editButton = screen.getByRole('button', { name: /edit component/i });
    const menuButton = screen.getByRole('button', { name: /component actions menu/i });
    expect(publishButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
    expect(menuButton).toBeInTheDocument();
    publishButton.click();

    // Should show hirearchy info
    expect(await screen.findByText(/Confirm Publish/i)).toBeInTheDocument();

    // Should hide all action buttons
    expect(publishButton).not.toBeInTheDocument();
    expect(editButton).not.toBeInTheDocument();
    expect(menuButton).not.toBeInTheDocument();

    // Click on Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();

    // Should show all action buttons
    expect(publishButton).not.toBeInTheDocument();
    expect(editButton).not.toBeInTheDocument();
    expect(menuButton).not.toBeInTheDocument();
  });

  it('should show publish confirmation on first publish', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyNeverPublished),
    );

    const publishButton = await screen.findByRole('button', { name: /Publish Changes/i });
    publishButton.click();

    // Should show the confirmation box
    expect(await screen.findByText(/Confirm Publish/i)).toBeInTheDocument();
    const secondPublishButton = await screen.getByRole('button', { name: /publish/i });
    secondPublishButton.click();
  });

  it('should show publish confirmation on already published', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyPublishedWithChanges),
    );

    const publishButton = await screen.findByRole('button', { name: /Publish Changes/i });
    await waitFor(() => expect(publishButton).not.toBeDisabled());
    publishButton.click();

    // Should show the confirmation box
    expect(await screen.findByText(/Confirm Publish/i)).toBeInTheDocument();
    const secondPublishButton = await screen.getByRole('button', { name: /publish/i });
    secondPublishButton.click();
  });

  it('should show publish confirmation on already published empty downstreams', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyPublishedWithChangesV2),
    );

    const publishButton = await screen.findByRole('button', { name: /Publish Changes/i });
    await waitFor(() => expect(publishButton).not.toBeDisabled());
    publishButton.click();

    // Should show the confirmation box
    expect(await screen.findByText(/Confirm Publish/i)).toBeInTheDocument();
    const secondPublishButton = await screen.getByRole('button', { name: /publish/i });
    secondPublishButton.click();
  });

  it('should show toast message when the component is published successfully', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    const url = getXBlockPublishApiUrl(mockLibraryBlockMetadata.usageKeyNeverPublished);
    axiosMock.onPost(url).reply(200);
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyNeverPublished),
    );

    const publishButton = await screen.findByRole('button', { name: /Publish Changes/i });
    publishButton.click();

    // Should show the confirmation box
    expect(await screen.findByText(/Confirm Publish/i)).toBeInTheDocument();
    const secondPublishButton = await screen.getByRole('button', { name: /publish/i });
    secondPublishButton.click();

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Component published successfully.');
    });
  });

  it('should show toast message when the component fails to be published', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    const url = getXBlockPublishApiUrl(mockLibraryBlockMetadata.usageKeyNeverPublished);
    axiosMock.onPost(url).reply(500);
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyNeverPublished),
    );

    const publishButton = await screen.findByRole('button', { name: /Publish Changes/i });
    publishButton.click();

    // Should show the confirmation box
    expect(await screen.findByText(/Confirm Publish/i)).toBeInTheDocument();
    const secondPublishButton = await screen.getByRole('button', { name: /publish/i });
    secondPublishButton.click();

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('There was an error publishing the component.');
    });
  });
});
