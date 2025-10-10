import type { ToastActionData } from '@src/generic/toast-context';
import { mockContentSearchConfig, mockSearchResult, hydrateSearchResult } from '@src/search-manager/data/api.mock';
import {
  fireEvent,
  render,
  screen,
  initializeMocks,
  waitFor,
} from '@src/testUtils';
import { LibraryProvider } from '../common/context/LibraryContext';
import { SidebarProvider } from '../common/context/SidebarContext';
import {
  mockContentLibrary, mockDeleteLibraryBlock, mockLibraryBlockMetadata, mockRestoreLibraryBlock,
} from '../data/api.mocks';
import ComponentDeleter from './ComponentDeleter';

mockContentLibrary.applyMock(); // Not required, but avoids 404 errors in the logs when <LibraryProvider> loads data
mockLibraryBlockMetadata.applyMock();
mockContentSearchConfig.applyMock();
const mockDelete = mockDeleteLibraryBlock.applyMock();
const mockRestore = mockRestoreLibraryBlock.applyMock();

const { libraryId } = mockContentLibrary;
const usageKey = mockLibraryBlockMetadata.usageKeyPublished;

const renderArgs = {
  path: '/library/:libraryId',
  params: { libraryId },
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>
      <SidebarProvider>
        { children }
      </SidebarProvider>
    </LibraryProvider>
  ),
};

let mockShowToast: { (message: string, action?: ToastActionData | undefined): void; mock?: any; };

describe('<ComponentDeleter />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    mockShowToast = mocks.mockShowToast;
    mockSearchResult(hydrateSearchResult([{
      displayName: 'Introduction to Testing 2',
    }]));
  });

  it('should shows a confirmation prompt the card with title and description', async () => {
    const mockCancel = jest.fn();
    render(<ComponentDeleter usageKey={usageKey} close={mockCancel} />, renderArgs);

    const modal = await screen.findByRole('dialog', { name: 'Delete Component' });
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
    render(<ComponentDeleter usageKey={usageKey} close={mockCancel} />, renderArgs);

    const modal = await screen.findByRole('dialog', { name: 'Delete Component' });
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

  it('should show units message if `unitsData` is set with one unit', async () => {
    const mockCancel = jest.fn();
    mockSearchResult(hydrateSearchResult([{
      displayName: 'Introduction to Testing 2',
      units: {
        displayName: ['Unit 1'],
        key: ['unit1'],
      },
    }]));
    render(
      <ComponentDeleter
        usageKey={usageKey}
        close={mockCancel}
      />,
      renderArgs,
    );

    const modal = await screen.findByRole('dialog', { name: 'Delete Component' });
    expect(modal).toBeVisible();

    expect(await screen.findByText(
      /by deleting this component, you will also be deleting it from in this library\./i,
    )).toBeInTheDocument();
    expect(screen.getByText(/unit 1/i)).toBeInTheDocument();
  });

  it('should show units message if `unitsData` is set with multiple units', async () => {
    const mockCancel = jest.fn();
    mockSearchResult(hydrateSearchResult([{
      displayName: 'Introduction to Testing 2',
      units: {
        displayName: ['Unit 1', 'Unit 2'],
        key: ['unit1', 'unit2'],
      },
    }]));
    render(
      <ComponentDeleter
        usageKey={usageKey}
        close={mockCancel}
      />,
      renderArgs,
    );

    const modal = await screen.findByRole('dialog', { name: 'Delete Component' });
    expect(modal).toBeVisible();

    expect(await screen.findByText(
      /by deleting this component, you will also be deleting it from in this library\./i,
    )).toBeInTheDocument();
    expect(screen.getByText(/2 units/i)).toBeInTheDocument();
  });
});
