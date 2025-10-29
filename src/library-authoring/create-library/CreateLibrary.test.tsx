import React from 'react';
import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  fireEvent,
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { getStudioHomeApiUrl } from '@src/studio-home/data/api';
import { getApiWaffleFlagsUrl } from '@src/data/api';
import { CreateLibrary } from '.';
import { getContentLibraryV2CreateApiUrl } from './data/api';
import { LibraryRestoreStatus } from './data/restoreConstants';
import messages from './messages';

const mockNavigate = jest.fn();
let axiosMock: MockAdapter;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@src/generic/data/apiHooks', () => ({
  ...jest.requireActual('@src/generic/data/apiHooks'),
  useOrganizationListData: () => ({
    data: ['org1', 'org2', 'org3', 'org4', 'org5'],
    isLoading: false,
  }),
}));

const mockRestoreMutate = jest.fn();
let mockRestoreStatusData: any = {};
let mockRestoreMutationError: any = null;
let mockRestoreMutationPending = false;
jest.mock('./data/apiHooks', () => ({
  ...jest.requireActual('./data/apiHooks'),
  useCreateLibraryRestore: () => ({
    mutate: mockRestoreMutate,
    error: mockRestoreMutationError,
    isPending: mockRestoreMutationPending,
    isError: !!mockRestoreMutationError,
  }),
  useGetLibraryRestoreStatus: () => ({
    data: mockRestoreStatusData,
  }),
}));

describe('<CreateLibrary />', () => {
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(undefined))
      .reply(200, {});
    // Reset restore mocks
    mockRestoreMutate.mockReset();
    mockRestoreStatusData = {};
    mockRestoreMutationError = null;
    mockRestoreMutationPending = false;
  });

  test('call api data with correct data', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'org1');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"description":"","title":"Test Library Name","org":"org1","slug":"test_library_slug"}',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/library/library-id');
    });
  });

  test('cannot create new org unless allowed', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    // We cannot create a new org, and so we're restricted to the allowed list
    const orgOptions = screen.getByTestId('autosuggest-iconbutton');
    await user.click(orgOptions);
    expect(screen.getByText('org1')).toBeInTheDocument();
    ['org2', 'org3', 'org4', 'org5'].forEach((org) => expect(screen.queryByText(org)).not.toBeInTheDocument());

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'NewOrg');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
    });
    expect(await screen.findByText('Required field.')).toBeInTheDocument();
  });

  test('can create new org if allowed', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, {
      ...studioHomeMock,
      allow_to_create_new_org: true,
    });
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    // We can create a new org, so we're also allowed to use any existing org
    const orgOptions = screen.getByTestId('autosuggest-iconbutton');
    await user.click(orgOptions);
    ['org1', 'org2', 'org3', 'org4', 'org5'].forEach((org) => expect(screen.queryByText(org)).toBeInTheDocument());

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'NewOrg');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"description":"","title":"Test Library Name","org":"NewOrg","slug":"test_library_slug"}',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/library/library-id');
    });
  });

  test('show api error', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(400, {
      field: 'Error message',
    });
    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByTestId('autosuggest-textbox-input');
    await user.click(orgInput);
    await user.type(orgInput, 'org1');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));
    await waitFor(async () => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"description":"","title":"Test Library Name","org":"org1","slug":"test_library_slug"}',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      const errorMessage = 'Request failed with status code 400{ "field": "Error message" }';
      expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  test('cancel creating library navigates to libraries page', async () => {
    render(<CreateLibrary />);

    fireEvent.click(await screen.findByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/libraries');
    });
  });

  test('calls handleCancel when used in modal', async () => {
    const mockHandleCancel = jest.fn();
    const mockHandlePostCreate = jest.fn();

    render(
      <CreateLibrary
        showInModal
        handleCancel={mockHandleCancel}
        handlePostCreate={mockHandlePostCreate}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(mockHandleCancel).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('calls handlePostCreate when used in modal and library is created', async () => {
    const mockHandleCancel = jest.fn();
    const mockHandlePostCreate = jest.fn();
    const user = userEvent.setup();

    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
      title: 'Test Library',
    });

    render(
      <CreateLibrary
        showInModal
        handleCancel={mockHandleCancel}
        handlePostCreate={mockHandlePostCreate}
      />,
    );

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'org1');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockHandlePostCreate).toHaveBeenCalledWith({
        id: 'library-id',
        title: 'Test Library',
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Archive Upload Functionality', () => {
    test('shows create from archive button and switches to archive mode', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      render(<CreateLibrary />);

      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      expect(createFromArchiveBtn).toBeInTheDocument();

      await user.click(createFromArchiveBtn);

      // Should show dropzone after switching to archive mode
      expect(screen.getByTestId('library-archive-dropzone')).toBeInTheDocument();
    });

    test('handles file upload and starts restore process', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      mockRestoreMutate.mockImplementation((_file: File, { onSuccess }: any) => {
        onSuccess({ taskId: 'task-123' });
      });

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Create a mock file
      const file = new File(['test content'], 'test-archive.zip', { type: 'application/zip' });
      const dropzone = screen.getByTestId('library-archive-dropzone');
      const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;

      // Mock file selection
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      // Trigger file change
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockRestoreMutate).toHaveBeenCalledWith(
          file,
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });
    });

    test('triggers onError callback when restore mutation fails during file upload', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      // Mock console.error to capture the call
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      // Mock the restore mutation to trigger onError callback immediately
      mockRestoreMutate.mockImplementation((_file: File, { onError }: any) => {
        const restoreError = new Error('Restore mutation failed');
        // Call onError immediately to trigger the handleError(restoreError) line
        onError(restoreError);
      });

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Upload a valid file that will trigger the restore process and its onError callback
      const file = new File(['test content'], 'test-archive.zip', { type: 'application/zip' });
      const dropzone = screen.getByTestId('library-archive-dropzone');
      const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockRestoreMutate).toHaveBeenCalledWith(
          file,
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          }),
        );
      });

      consoleSpy.mockRestore();
    });

    test('shows restore in progress alert when status is pending', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      // Set task ID so the restore status hook is enabled
      const mockTaskId = 'test-task-123';

      // Pre-set the restore status to pending
      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Pending,
        result: null,
        error: null,
        errorLog: null,
      };

      // Mock the mutation to return a task ID
      mockRestoreMutate.mockImplementation((_file: File, { onSuccess }: any) => {
        onSuccess({ taskId: mockTaskId });
      });

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Upload a file to trigger the restore process
      const file = new File(['test content'], 'test-archive.zip', { type: 'application/zip' });
      const dropzone = screen.getByTestId('library-archive-dropzone');
      const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      // Should show the restore in progress alert
      await waitFor(() => {
        expect(screen.getByText(messages.restoreInProgress.defaultMessage)).toBeInTheDocument();
      });
    });

    test('shows success state with archive details after upload', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      const mockResult = {
        learningPackageId: 123,
        title: 'Test Archive Library',
        org: 'TestOrg',
        slug: 'test-archive',
        key: 'TestOrg/test-archive',
        archiveKey: 'archive-key',
        containers: 5,
        components: 15,
        collections: 3,
        sections: 8,
        subsections: 12,
        units: 20,
        createdOnServer: '2025-01-01T10:00:00Z',
        createdAt: '2025-01-01T10:00:00Z',
        createdBy: {
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      // Pre-set the restore status to succeeded
      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Succeeded,
        result: mockResult,
        error: null,
        errorLog: null,
      };

      // Mock the restore mutation to return a task ID
      mockRestoreMutate.mockImplementation((_file: File, { onSuccess }: any) => {
        onSuccess({ taskId: 'task-123' });
      });

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Upload a file to trigger the restore process
      const file = new File(['test content'], 'test-archive.zip', { type: 'application/zip' });
      const dropzone = screen.getByTestId('library-archive-dropzone');
      const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      // Wait for the restore to complete and archive details to be shown
      await waitFor(() => {
        expect(screen.getByText('Test Archive Library')).toBeInTheDocument();
        expect(screen.getByText('TestOrg / test-archive')).toBeInTheDocument();
        expect(screen.getByText(/Contains 15 Components/i)).toBeInTheDocument();
      });
    });

    test('shows error state with error message and link after failed upload', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      // Pre-set the restore status to failed
      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Failed,
        result: null,
        error: 'Library restore failed. See error log for details.',
        errorLog: 'http://example.com/error.log',
      };

      // Mock the restore mutation to return a task ID
      mockRestoreMutate.mockImplementation((_file: File, { onSuccess }: any) => {
        onSuccess({ taskId: 'task-456' });
      });

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Upload a file to trigger the restore process
      const file = new File(['test content'], 'test-archive.zip', { type: 'application/zip' });
      const dropzone = screen.getByTestId('library-archive-dropzone');
      const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      // Wait for the error to be shown
      await waitFor(() => {
        expect(screen.getByText(messages.restoreError.defaultMessage)).toBeInTheDocument();
      });

      // Should show error log link
      const errorLink = screen.getByText(messages.viewErrorLogText.defaultMessage);
      expect(errorLink).toBeInTheDocument();
      expect(errorLink.closest('a')).toHaveAttribute('href', 'http://example.com/error.log');
    });

    test('validates file types and shows error for invalid files', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Try to upload a file with correct MIME type but wrong extension to trigger our custom validation
      const file = new File(['test content'], 'test-file.doc', { type: 'application/zip' });
      const dropzone = screen.getByTestId('library-archive-dropzone');
      const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      // Should not call restore mutation for invalid file
      expect(mockRestoreMutate).not.toHaveBeenCalled();

      // Should show error message for invalid file type (Dropzone shows generic error)
      await waitFor(() => {
        expect(screen.getByText(/A problem occured while uploading your file/i)).toBeInTheDocument();
      });
    });

    test('shows archive preview only when all conditions are met', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      const mockResult = {
        learningPackageId: 123,
        title: 'Test Archive Library',
        org: 'TestOrg',
        slug: 'test-archive',
        key: 'TestOrg/test-archive',
        archiveKey: 'archive-key',
        containers: 5,
        components: 15,
        collections: 3,
        sections: 8,
        subsections: 12,
        units: 20,
        createdOnServer: '2025-01-01T10:00:00Z',
        createdAt: '2025-01-01T10:00:00Z',
        createdBy: {
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Initially no archive preview should be shown (no uploaded file)
      expect(screen.queryByText('Test Archive Library')).not.toBeInTheDocument();

      // Pre-set the final restore status to succeeded
      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Succeeded,
        result: mockResult,
      };

      // Mock successful file upload
      mockRestoreMutate.mockImplementation((_file: File, { onSuccess }: any) => {
        onSuccess({ taskId: 'task-123' });
      });

      // Upload file
      const file = new File(['test content'], 'test-archive.zip', { type: 'application/zip' });
      const dropzone = screen.getByTestId('library-archive-dropzone');
      const input = dropzone.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      // Now archive preview should be shown because:
      // uploadedFile && restoreStatus?.state === LibraryRestoreStatus.Succeeded && restoreStatus.result
      await waitFor(() => {
        expect(screen.getByText('Test Archive Library')).toBeInTheDocument();
        expect(screen.getByText('TestOrg / test-archive')).toBeInTheDocument();
      });
    });

    test('creates library from archive with learning package ID', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
      axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
        id: 'library-from-archive-id',
      });

      const mockResult = {
        learningPackageId: 456, // Fixed: use camelCase to match actual API response
        title: 'Restored Library',
        org: 'RestoredOrg',
        slug: 'restored-lib',
        key: 'RestoredOrg/restored-lib',
        archiveKey: 'archive-key', // Fixed: use camelCase
        containers: 3,
        components: 10,
        collections: 2,
        sections: 5,
        subsections: 8,
        units: 15,
        createdOnServer: '2025-01-01T12:00:00Z', // Fixed: use camelCase
        createdAt: '2025-01-01T12:00:00Z',
        createdBy: { // Fixed: use camelCase
          username: 'restoreuser',
          email: 'restore@example.com',
        },
      };

      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Succeeded,
        result: mockResult,
        error: null,
        errorLog: null,
      };

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Fill in form fields
      const titleInput = await screen.findByRole('textbox', { name: /library name/i });
      await user.click(titleInput);
      await user.type(titleInput, 'New Library from Archive');

      const orgInput = await screen.findByRole('combobox', { name: /organization/i });
      await user.click(orgInput);
      await user.type(orgInput, 'org1');
      await user.tab();

      const slugInput = await screen.findByRole('textbox', { name: /library id/i });
      await user.click(slugInput);
      await user.type(slugInput, 'new_library_slug');

      // Submit form
      fireEvent.click(await screen.findByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
        const postData = JSON.parse(axiosMock.history.post[0].data);
        expect(postData).toEqual({
          description: '',
          title: 'New Library from Archive',
          org: 'org1',
          slug: 'new_library_slug',
          learning_package: 456, // Should include the learning_package_id from restore
        });
        expect(mockNavigate).toHaveBeenCalledWith('/library/library-from-archive-id');
      });
    });

    test('handles restore mutation error', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      mockRestoreMutationError = new Error('Upload failed');

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Should show error alert with the specific error message
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });

    test('shows generic error when no specific error message available', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);

      mockRestoreMutationError = {}; // Error without message

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Should show generic error message
      expect(screen.getByText(messages.genericErrorMessage.defaultMessage)).toBeInTheDocument();
    });

    test('includes learning_package field when creating from successful archive restore', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
      axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
        id: 'library-from-archive-id',
      });

      // Set up successful restore state with learningPackageId
      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Succeeded,
        result: {
          learningPackageId: 789,
          title: 'Archive Library',
          org: 'ArchiveOrg',
          slug: 'archive-slug',
          key: 'ArchiveOrg/archive-slug',
          archiveKey: 'test-archive-key',
          containers: 2,
          components: 8,
          collections: 1,
          sections: 4,
          subsections: 6,
          units: 10,
          createdOnServer: '2025-01-01T15:00:00Z',
          createdAt: '2025-01-01T15:00:00Z',
          createdBy: {
            username: 'archiveuser',
            email: 'archive@example.com',
          },
        },
        error: null,
        errorLog: null,
      };

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Fill in form fields
      const titleInput = await screen.findByRole('textbox', { name: /library name/i });
      await user.type(titleInput, 'My New Library');

      const orgInput = await screen.findByRole('combobox', { name: /organization/i });
      await user.click(orgInput);
      await user.type(orgInput, 'org1');
      await user.tab();

      const slugInput = await screen.findByRole('textbox', { name: /library id/i });
      await user.type(slugInput, 'my_new_library');

      // Submit the form - this should trigger the code path that includes learning_package
      fireEvent.click(await screen.findByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
        const postData = JSON.parse(axiosMock.history.post[0].data);

        // Verify that the learning_package field is included with the correct value
        expect(postData).toEqual({
          description: '',
          title: 'My New Library',
          org: 'org1',
          slug: 'my_new_library',
          learning_package: 789, // Tests: submitData.learning_package = restoreStatus.result.learningPackageId
        });
      });
    });

    test('does not include learning_package when creating from archive but restore failed', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
      axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
        id: 'library-from-failed-restore-id',
      });

      // Set up failed restore state
      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Failed,
        result: null,
        error: 'Restore failed',
        errorLog: null,
      };

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Fill in form fields
      const titleInput = await screen.findByRole('textbox', { name: /library name/i });
      await user.type(titleInput, 'Library from Failed Restore');

      const orgInput = await screen.findByRole('combobox', { name: /organization/i });
      await user.click(orgInput);
      await user.type(orgInput, 'org1');
      await user.tab();

      const slugInput = await screen.findByRole('textbox', { name: /library id/i });
      await user.type(slugInput, 'failed_restore_lib');

      // Submit the form - this should NOT include learning_package since restore failed
      fireEvent.click(await screen.findByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
        const postData = JSON.parse(axiosMock.history.post[0].data);

        // Verify that learning_package field is NOT included since restore failed
        expect(postData).toEqual({
          description: '',
          title: 'Library from Failed Restore',
          org: 'org1',
          slug: 'failed_restore_lib',
        });
        expect(postData).not.toHaveProperty('learning_package');
      });
    });

    test('does not include learning_package when creating from archive but result is null', async () => {
      const user = userEvent.setup();
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
      axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
        id: 'library-from-null-result-id',
      });

      // Set up successful restore state but with null result
      mockRestoreStatusData = {
        state: LibraryRestoreStatus.Succeeded,
        result: null,
        error: null,
        errorLog: null,
      };

      render(<CreateLibrary />);

      // Switch to archive mode
      const createFromArchiveBtn = await screen.findByRole('button', { name: messages.createFromArchiveButton.defaultMessage });
      await user.click(createFromArchiveBtn);

      // Fill in form fields
      const titleInput = await screen.findByRole('textbox', { name: /library name/i });
      await user.type(titleInput, 'Library with Null Result');

      const orgInput = await screen.findByRole('combobox', { name: /organization/i });
      await user.click(orgInput);
      await user.type(orgInput, 'org1');
      await user.tab();

      const slugInput = await screen.findByRole('textbox', { name: /library id/i });
      await user.type(slugInput, 'null_result_lib');

      // Submit the form - this should NOT include learning_package since result is null
      fireEvent.click(await screen.findByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
        const postData = JSON.parse(axiosMock.history.post[0].data);

        // Verify that learning_package field is NOT included since result is null
        expect(postData).toEqual({
          description: '',
          title: 'Library with Null Result',
          org: 'org1',
          slug: 'null_result_lib',
        });
        expect(postData).not.toHaveProperty('learning_package');
      });
    });
  });
});
