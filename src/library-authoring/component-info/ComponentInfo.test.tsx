import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '../../testUtils';
import { mockContentLibrary, mockLibraryBlockMetadata } from '../data/api.mocks';
import { mockBroadcastChannel } from '../../generic/data/api.mock';
import { LibraryProvider } from '../common/context';
import ComponentInfo from './ComponentInfo';

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
    <LibraryProvider
      libraryId={libraryId}
      sidebarComponentUsageKey={sidebarComponentUsageKey}
    >
      {children}
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
});
