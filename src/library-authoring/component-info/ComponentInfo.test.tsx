import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import { mockBroadcastChannel } from '../../generic/data/api.mock';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarBodyComponentId, SidebarProvider } from '../common/context/SidebarContext';
import ComponentInfo from './ComponentInfo';
import { getXBlockPublishApiUrl } from '../data/api';

mockBroadcastChannel();
mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
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
        initialSidebarComponentInfo={{
          id: sidebarComponentUsageKey,
          type: SidebarBodyComponentId.ComponentInfo,
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
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyThirdPartyXBlock),
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

  it('should show a disabled "Publish" button when the component is already published', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyPublishDisabled),
    );
    const publishButton = await screen.findByRole('button', { name: /Publish component/ });
    expect(publishButton).toBeDisabled();
  });

  it('should show a working "Publish" button when the component is not published', async () => {
    initializeMocks();
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyNeverPublished),
    );
    const publishButton = await screen.findByRole('button', { name: /Publish component/ });
    await waitFor(() => expect(publishButton).not.toBeDisabled());
  });

  it('should show toast message when the component is published successfully', async () => {
    const { axiosMock, mockShowToast } = initializeMocks();
    const url = getXBlockPublishApiUrl(mockLibraryBlockMetadata.usageKeyNeverPublished);
    axiosMock.onPost(url).reply(200);
    render(
      <ComponentInfo />,
      withLibraryId(mockContentLibrary.libraryId, mockLibraryBlockMetadata.usageKeyNeverPublished),
    );

    const publishButton = await screen.findByRole('button', { name: /Publish component/i });
    publishButton.click();

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

    const publishButton = await screen.findByRole('button', { name: /Publish component/i });
    publishButton.click();

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('There was an error publishing the component.');
    });
  });
});
