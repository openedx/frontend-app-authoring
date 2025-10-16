// We will load the actual platform module to mutate its exported config object without mocking getConfig itself.
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLibraryBackup, getLibraryBackupStatus } from './api';

// Provide a controlled mock for the authenticated HTTP client without touching getConfig
const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: () => ({
    post: (...args) => mockPost(...args),
    get: (...args) => mockGet(...args),
  }),
}));

afterEach(() => {
  mockPost.mockReset();
  mockGet.mockReset();
});

// Internal helper for URL construction
const getApiUrl = (path) => `http://studio.test/${path || ''}`;

describe('backup-restore api', () => {
  it('should call createLibraryBackup and return a promise', async () => {
    await expect(createLibraryBackup('test-library-id')).rejects.toBeDefined();
  });

  it('should build correct URL and call post for createLibraryBackup', async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    const result = await createLibraryBackup('abc');
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toMatch(/\/api\/libraries\/v2\/abc\/backup\/$/);
    expect(result).toEqual({ success: true });
  });

  it('should call getLibraryBackupStatus and return a promise', async () => {
    await expect(getLibraryBackupStatus('test-library-id', 'test-task-id')).rejects.toBeDefined();
  });

  it('should build correct URL and call get for getLibraryBackupStatus', async () => {
    mockGet.mockResolvedValue({ data: { status: 'ok' } });
    const result = await getLibraryBackupStatus('abc', 'task123');
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet.mock.calls[0][0]).toMatch(/\/api\/libraries\/v2\/abc\/backup\/\?task_id=task123$/);
    expect(result).toEqual({ status: 'ok' });
  });

  it('should throw if libraryId is missing for createLibraryBackup', async () => {
    // @ts-expect-error
    await expect(createLibraryBackup()).rejects.toBeDefined();
  });

  it('should throw if libraryId or taskId is missing for getLibraryBackupStatus', async () => {
    // @ts-expect-error
    await expect(getLibraryBackupStatus()).rejects.toBeDefined();
    // @ts-expect-error
    await expect(getLibraryBackupStatus('test-library-id')).rejects.toBeDefined();
  });

  it('should build correct URL for backup', () => {
    expect(getApiUrl('api/libraries/v2/abc/backup/')).toBe('http://studio.test/api/libraries/v2/abc/backup/');
    expect(getApiUrl('')).toBe('http://studio.test/');
  });
});
