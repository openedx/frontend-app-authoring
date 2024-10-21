import { getLibraryId } from '../../generic/key-utils';
import {
  fireEvent,
  render,
  screen,
  initializeMocks,
  waitFor,
} from '../../testUtils';
import { LibraryProvider } from '../common/context';
import { mockContentLibrary, mockDeleteLibraryBlock, mockLibraryBlockMetadata } from '../data/api.mocks';
import ComponentDeleter from './ComponentDeleter';

mockContentLibrary.applyMock(); // Not required, but avoids 404 errors in the logs when <LibraryProvider> loads data
mockLibraryBlockMetadata.applyMock();
const mockDelete = mockDeleteLibraryBlock.applyMock();

const usageKey = mockLibraryBlockMetadata.usageKeyPublished;

const renderArgs = {
  extraWrapper: ({ children }: { children: React.ReactNode }) => (
    <LibraryProvider libraryId={getLibraryId(usageKey)}>{children}</LibraryProvider>
  ),
};

describe('<ComponentDeleter />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('is invisible when isConfirmingDelete is false', async () => {
    const mockCancel = jest.fn();
    render(<ComponentDeleter usageKey={usageKey} isConfirmingDelete={false} cancelDelete={mockCancel} />, renderArgs);

    const modal = screen.queryByRole('dialog', { name: 'Delete Component' });
    expect(modal).not.toBeInTheDocument();
  });

  it('should shows a confirmation prompt the card with title and description', async () => {
    const mockCancel = jest.fn();
    render(<ComponentDeleter usageKey={usageKey} isConfirmingDelete cancelDelete={mockCancel} />, renderArgs);

    const modal = screen.getByRole('dialog', { name: 'Delete Component' });
    expect(modal).toBeVisible();

    // It should mention the component's name in the confirm dialog:
    await screen.findByText('Introduction to Testing 2');

    // Clicking cancel will cancel:
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockCancel).toHaveBeenCalled();
  });

  it('deletes the block when confirmed', async () => {
    const mockCancel = jest.fn();
    render(<ComponentDeleter usageKey={usageKey} isConfirmingDelete cancelDelete={mockCancel} />, renderArgs);

    const modal = screen.getByRole('dialog', { name: 'Delete Component' });
    expect(modal).toBeVisible();

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });
    expect(mockCancel).toHaveBeenCalled(); // In order to close the modal, this also gets called.
  });
});
