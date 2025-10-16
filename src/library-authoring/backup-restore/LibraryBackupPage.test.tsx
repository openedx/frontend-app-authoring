import {
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { LibraryBackupStatus } from './data/constants';
import { LibraryBackupPage } from './LibraryBackupPage';
import messages from './messages';

// Mock the hooks/context used by the page so we can render it in isolation.
jest.mock('@src/library-authoring/common/context/LibraryContext', () => ({
  useLibraryContext: () => ({ libraryId: 'lib:TestOrg:test-lib' }),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const mockLibraryData: { data: any } = { data: {} };

jest.mock('@src/library-authoring/data/apiHooks', () => ({
  useContentLibrary: () => (mockLibraryData),
}));

// Mutable mocks varied per test
const mockMutate = jest.fn();
let mockStatusData: any = {};
let mockMutationError: any = null; // allows testing mutation error branch
jest.mock('@src/library-authoring/backup-restore/data/hooks', () => ({
  useCreateLibraryBackup: () => ({
    mutate: mockMutate,
    error: mockMutationError,
  }),
  useGetLibraryBackupStatus: () => ({
    data: mockStatusData,
  }),
}));

describe('<LibraryBackupPage />', () => {
  beforeEach(() => {
    initializeMocks();
    mockMutate.mockReset();
    mockStatusData = {};
    mockLibraryData.data = {
      title: 'My Test Library',
      slug: 'test-lib',
      org: 'TestOrg',
    };
    mockMutationError = null;
  });

  it('returns NotFoundAlert if no libraryData', () => {
    mockLibraryData.data = undefined;

    render(<LibraryBackupPage />);

    expect(screen.getByText(/Not Found/i)).toBeVisible();
  });

  it('renders the backup page title and initial download button', () => {
    mockStatusData = {};
    render(<LibraryBackupPage />);
    expect(screen.getByText(messages.backupPageTitle.defaultMessage)).toBeVisible();
    const button = screen.getByRole('button', { name: messages.downloadAriaLabel.defaultMessage });
    expect(button).toBeEnabled();
  });

  it('shows pending state disables button after starting backup', async () => {
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      mockStatusData = { state: LibraryBackupStatus.Pending };
    });
    render(<LibraryBackupPage />);
    const initialButton = screen.getByRole('button', { name: messages.downloadAriaLabel.defaultMessage });
    expect(initialButton).toBeEnabled();
    await userEvent.click(initialButton);
    const pendingText = await screen.findByText(messages.backupPending.defaultMessage);
    const pendingButton = pendingText.closest('button');
    expect(pendingButton).toBeDisabled();
  });

  it('shows exporting state disables button and changes text', async () => {
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      mockStatusData = { state: LibraryBackupStatus.Exporting };
    });
    render(<LibraryBackupPage />);
    const initialButton = screen.getByRole('button', { name: messages.downloadAriaLabel.defaultMessage });
    await userEvent.click(initialButton);
    const exportingText = await screen.findByText(messages.backupExporting.defaultMessage);
    const exportingButton = exportingText.closest('button');
    expect(exportingButton).toBeDisabled();
  });

  it('shows succeeded state uses ready text and triggers download', () => {
    mockStatusData = { state: 'Succeeded', url: '/fake/path.tar.gz' };
    const downloadSpy = jest.spyOn(document, 'createElement');
    render(<LibraryBackupPage />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(messages.downloadReadyButton.defaultMessage);
    userEvent.click(button);
    expect(downloadSpy).toHaveBeenCalledWith('a');
    downloadSpy.mockRestore();
  });

  it('shows failed state and error alert', () => {
    mockStatusData = { state: LibraryBackupStatus.Failed };
    render(<LibraryBackupPage />);
    expect(screen.getByText(messages.backupFailedError.defaultMessage)).toBeVisible();
    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
  });

  it('covers timeout cleanup on unmount', () => {
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      mockStatusData = { state: LibraryBackupStatus.Pending };
    });
    const { unmount } = render(<LibraryBackupPage />);
    const button = screen.getByRole('button');
    userEvent.click(button);
    unmount();
    // No assertion needed, just coverage for cleanup
  });

  it('covers fallback download logic', () => {
    mockStatusData = { state: LibraryBackupStatus.Succeeded, url: '/fake/path.tar.gz' };
    // Spy on createElement to force click failure for anchor
    const originalCreate = document.createElement.bind(document);
    const createSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreate(tagName);
      if (tagName === 'a') {
        // Force failure when click is invoked
        (el as any).click = () => { throw new Error('fail'); };
      }
      return el;
    });
    // Stub window.location.href writable
    const originalLocation = window.location;
    // Use a minimal fake location object
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.location;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location = { href: '' };
    render(<LibraryBackupPage />);
    const button = screen.getByRole('button');
    userEvent.click(button);
    expect(window.location.href).toContain('/fake/path.tar.gz');
    // restore
    createSpy.mockRestore();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location = originalLocation;
  });
});
