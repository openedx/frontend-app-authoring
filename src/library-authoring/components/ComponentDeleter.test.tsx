import type { ToastActionData } from '../../generic/toast-context';
import {
  fireEvent,
  render,
  screen,
  initializeMocks,
  waitFor,
} from '../../testUtils';
import { SidebarProvider } from '../common/context/SidebarContext';
import {
  mockContentLibrary, mockDeleteLibraryBlock, mockLibraryBlockMetadata, mockRestoreLibraryBlock,
} from '../data/api.mocks';
import ComponentDeleter from './ComponentDeleter';

mockContentLibrary.applyMock(); // Not required, but avoids 404 errors in the logs when <LibraryProvider> loads data
mockLibraryBlockMetadata.applyMock();
const mockDelete = mockDeleteLibraryBlock.applyMock();
const mockRestore = mockRestoreLibraryBlock.applyMock();

const usageKey = mockLibraryBlockMetadata.usageKeyPublished;

const renderArgs = {
  extraWrapper: SidebarProvider,
};

let mockShowToast: { (message: string, action?: ToastActionData | undefined): void; mock?: any; };

describe('<ComponentDeleter />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast;
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

  it('deletes the block when confirmed, shows a toast with undo option and restores block on undo', async () => {
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
    expect(mockShowToast).toHaveBeenCalled();
    // Get restore / undo func from the toast
    const restoreFn = mockShowToast.mock.calls[0][1].onClick;
    restoreFn();
    await waitFor(() => {
      expect(mockRestore).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Undo successful');
    });
  });
});
