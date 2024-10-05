import {
  fireEvent,
  initializeMocks,
  render,
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
import { LibraryProvider } from '../common/context';
import { ComponentAdvancedInfo } from './ComponentAdvancedInfo';

mockContentLibrary.applyMock();
mockLibraryBlockMetadata.applyMock();
mockXBlockAssets.applyMock();
mockXBlockOLX.applyMock();
const setOLXspy = mockSetXBlockOLX.applyMock();

const withLibraryId = (libraryId: string = mockContentLibrary.libraryId) => ({
  extraWrapper: ({ children }: { children: React.ReactNode }) => (
    <LibraryProvider libraryId={libraryId}>{children}</LibraryProvider>
  ),
});

describe('<ComponentAdvancedInfo />', () => {
  it('should display nothing when collapsed', async () => {
    initializeMocks();
    render(<ComponentAdvancedInfo usageKey={mockLibraryBlockMetadata.usageKeyPublished} />, withLibraryId());
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    expect(expandButton).toBeInTheDocument();
    expect(screen.queryByText(mockLibraryBlockMetadata.usageKeyPublished)).not.toBeInTheDocument();
  });

  it('should display the usage key of the block (when expanded)', async () => {
    initializeMocks();
    render(<ComponentAdvancedInfo usageKey={mockLibraryBlockMetadata.usageKeyPublished} />, withLibraryId());
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    expect(await screen.findByText(mockLibraryBlockMetadata.usageKeyPublished)).toBeInTheDocument();
  });

  it('should display the static assets of the block (when expanded)', async () => {
    initializeMocks();
    render(<ComponentAdvancedInfo usageKey={mockLibraryBlockMetadata.usageKeyPublished} />, withLibraryId());
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    expect(await screen.findByText(/static\/image1\.png/)).toBeInTheDocument();
    expect(await screen.findByText(/\(12M\)/)).toBeInTheDocument(); // size of the above file
    expect(await screen.findByText(/static\/data\.csv/)).toBeInTheDocument();
    expect(await screen.findByText(/\(8K\)/)).toBeInTheDocument(); // size of the above file
  });

  it('should display the OLX source of the block (when expanded)', async () => {
    initializeMocks();
    render(<ComponentAdvancedInfo usageKey={mockXBlockOLX.usageKeyHtml} />, withLibraryId());
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    // Because of syntax highlighting, the OLX will be borken up by many different tags so we need to search for
    // just a substring:
    const olxPart = /This is a text component which uses/;
    expect(await screen.findByText(olxPart)).toBeInTheDocument();
  });

  it('does not display "Edit OLX" button when the library is read-only', async () => {
    initializeMocks();
    render(
      <ComponentAdvancedInfo usageKey={mockXBlockOLX.usageKeyHtml} />,
      withLibraryId(mockContentLibrary.libraryIdReadOnly),
    );
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    expect(screen.queryByRole('button', { name: /Edit OLX/ })).not.toBeInTheDocument();
  });

  it('can edit the OLX', async () => {
    initializeMocks();
    render(<ComponentAdvancedInfo usageKey={mockLibraryBlockMetadata.usageKeyPublished} />, withLibraryId());
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
    initializeMocks();

    setOLXspy.mockImplementation(async () => {
      throw new Error('Example error - setting OLX failed');
    });

    render(<ComponentAdvancedInfo usageKey={mockLibraryBlockMetadata.usageKeyPublished} />, withLibraryId());
    const expandButton = await screen.findByRole('button', { name: /Advanced details/ });
    fireEvent.click(expandButton);
    const editButton = await screen.findByRole('button', { name: /Edit OLX/ });
    fireEvent.click(editButton);
    const saveButton = await screen.findByRole('button', { name: /Save/ });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/An error occurred and the OLX could not be saved./)).toBeInTheDocument();
  });
});
