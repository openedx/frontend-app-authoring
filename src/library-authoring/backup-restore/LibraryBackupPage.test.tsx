import { LibraryProvider } from '@src/library-authoring/common/context/LibraryContext';
import { mockContentLibrary } from '@src/library-authoring/data/api.mocks';
import {
  act,
  render as baseRender,
  initializeMocks,
  screen,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { LibraryBackupStatus } from './data/constants';
import { LibraryBackupPage } from './LibraryBackupPage';
import messages from './messages';

const render = (libraryId: string = mockContentLibrary.libraryId) => baseRender(<LibraryBackupPage />, {
  extraWrapper: ({ children }) => (
    <LibraryProvider libraryId={libraryId}>{children}</LibraryProvider>
  ),
});

// Mocking i18n to prevent having to generate all dynamic translations for this specific test file
// Other tests can still use the real implementation as needed
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const mockLibraryData:
{ data: typeof mockContentLibrary.libraryData | undefined } = { data: mockContentLibrary.libraryData };

// TODO: consider using the usual mockContentLibrary.applyMocks pattern after figuring out
// why it doesn't work here as expected
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
    mockMutationError = null;
    mockLibraryData.data = mockContentLibrary.libraryData;
  });

  it('returns NotFoundAlert if no libraryData', () => {
    mockLibraryData.data = undefined as any;
    render(mockContentLibrary.libraryIdThatNeverLoads);

    expect(screen.getByText(/Not Found/i)).toBeVisible();
  });

  it('renders the backup page title and initial download button', () => {
    render();
    expect(screen.getByText(messages.backupPageTitle.defaultMessage)).toBeVisible();
    const button = screen.getByRole('button', { name: messages.downloadAriaLabel.defaultMessage });
    expect(button).toBeEnabled();
  });

  it('shows pending state disables button after starting backup', async () => {
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      mockStatusData = { state: LibraryBackupStatus.Pending };
    });
    render();
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
    render();
    const initialButton = screen.getByRole('button', { name: messages.downloadAriaLabel.defaultMessage });
    await userEvent.click(initialButton);
    const exportingText = await screen.findByText(messages.backupExporting.defaultMessage);
    const exportingButton = exportingText.closest('button');
    expect(exportingButton).toBeDisabled();
  });

  it('shows succeeded state uses ready text and triggers download', async () => {
    mockStatusData = { state: 'Succeeded', url: '/fake/path.tar.gz' };
    const downloadSpy = jest.spyOn(document, 'createElement');
    render();
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(messages.downloadReadyButton.defaultMessage);
    await userEvent.click(button);
    expect(downloadSpy).toHaveBeenCalledWith('a');
    downloadSpy.mockRestore();
  });

  it('shows failed state and error alert', () => {
    mockStatusData = { state: LibraryBackupStatus.Failed };
    render();
    expect(screen.getByText(messages.backupFailedError.defaultMessage)).toBeVisible();
    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
  });

  it('covers timeout cleanup on unmount', async () => {
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      mockStatusData = { state: LibraryBackupStatus.Pending };
    });
    const { unmount } = render();
    const button = screen.getByRole('button');
    await userEvent.click(button);
    unmount();
    // No assertion needed, just coverage for cleanup
  });

  it('covers fallback download logic', async () => {
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
    render();
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(window.location.href).toContain('/fake/path.tar.gz');
    // restore
    createSpy.mockRestore();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.location = originalLocation;
  });

  it('executes timeout callback clearing task and re-enabling button after 5 minutes', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      mockStatusData = { state: LibraryBackupStatus.Pending };
    });
    render();
    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
    await user.click(button);

    // Now in progress
    expect(button).toBeDisabled();
    act(() => {
      jest.advanceTimersByTime(1 * 60 * 1000); // advance 1 minutes
    });
    // After timeout callback, should be enabled again
    expect(button).toBeEnabled();
    jest.useRealTimers();
  });

  it('shows pending message when mutation is in progress but no backup state yet', async () => {
    // Mock mutation to trigger onSuccess but don't immediately set backup state
    mockMutate.mockImplementation((_arg: any, { onSuccess }: any) => {
      onSuccess({ task_id: 'task-123' });
      // Don't set mockStatusData.state immediately to simulate the state
      // before the status API has returned any backup state
    });

    render();
    const button = screen.getByRole('button');

    await userEvent.click(button);

    // This should trigger the specific line: return intl.formatMessage(messages.backupPending);
    // when isMutationInProgress is true but !backupState
    expect(screen.getByText(messages.backupPending.defaultMessage)).toBeVisible();
    expect(button).toBeDisabled();
  });

  it('downloads backup immediately when clicking button with already succeeded backup', async () => {
    // Set up a scenario where backup is already succeeded with a URL
    mockStatusData = {
      state: LibraryBackupStatus.Succeeded,
      url: '/api/libraries/v2/backup/download/test-backup.tar.gz',
    };

    render();

    // Spy on handleDownload function call
    const createElementSpy = jest.spyOn(document, 'createElement');
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    createElementSpy.mockReturnValue(mockAnchor as any);
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

    const button = screen.getByRole('button');

    // Click the button - this should trigger the early return in handleDownloadBackup
    await userEvent.click(button);

    // Verify the download was triggered
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchor.href).toContain('/api/libraries/v2/backup/download/test-backup.tar.gz');
    expect(mockAnchor.download).toContain('backup.tar.gz');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);

    // Verify mutate was NOT called since backup already exists
    expect(mockMutate).not.toHaveBeenCalled();

    // Clean up spies
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
