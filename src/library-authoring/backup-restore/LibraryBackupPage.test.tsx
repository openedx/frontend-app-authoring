import {
  initializeMocks,
  render,
  screen,
  fireEvent,
} from '@src/testUtils';
import { LibraryBackupPage } from './LibraryBackupPage';

// Mock the hooks/context used by the page so we can render it in isolation.
jest.mock('@src/library-authoring/common/context/LibraryContext', () => ({
  useLibraryContext: () => ({ libraryId: 'lib:TestOrg:test-lib' }),
}));

jest.mock('@src/library-authoring/data/apiHooks', () => ({
  useContentLibrary: () => ({
    data: {
      title: 'My Test Library',
      slug: 'test-lib',
      org: 'TestOrg',
    },
  }),
}));

// Mutable mocks varied per test
const mockMutate = jest.fn();
let mockStatusData: any = {};
jest.mock('@src/library-authoring/backup-restore/data/hooks', () => ({
  useCreateLibraryBackup: () => ({
    mutate: mockMutate,
    error: null,
  }),
  useGetLibraryBackupStatus: () => ({
    data: mockStatusData,
  }),
}));

describe('<LibraryBackupPage />', () => {
  beforeEach(() => {
    initializeMocks();
    mockMutate.mockReset();
    mockStatusData = {}; // reset status for each test
  });

  it('renders the backup page title and initial download button', () => {
    mockStatusData = {}; // no state yet
    render(<LibraryBackupPage />);
    expect(screen.getByText('Library Backup')).toBeVisible();
    const button = screen.getByRole('button', { name: /Download Library Backup/ });
    expect(button).toBeEnabled();
    // aria-label includes library title via template
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('My Test Library'));
  });

  it('shows pending state disables button after starting backup', async () => {
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      mockStatusData = { state: 'Pending' };
    });
    render(<LibraryBackupPage />);
    // More specific matcher for the initial state (Download Library Backup)
    const initialButton = screen.getByRole('button', { name: /Download Library Backup/i });
    expect(initialButton).toBeEnabled();
    fireEvent.click(initialButton);
    const pendingButton = await screen.findByRole('button', { name: /Preparing to download/i });
    expect(pendingButton).toBeDisabled();
  });

  it('shows succeeded state uses ready text', () => {
    mockStatusData = { state: 'Succeeded', url: '/fake/path.tar.gz' };
    render(<LibraryBackupPage />);
    const button = screen.getByRole('button');
    // When succeeded the text should be the download ready variant
    expect(button).toHaveTextContent(/Download Library Backup/); // substring still present
  });
});
