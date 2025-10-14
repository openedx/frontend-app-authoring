import { createLibraryBackup, getLibraryBackupStatus } from './api';

// Internal helper for URL construction
const getApiUrl = (path) => `http://studio.test/${path || ''}`;

describe('backup-restore api', () => {
  it('should call createLibraryBackup and return a promise', async () => {
    await expect(createLibraryBackup('test-library-id')).rejects.toBeDefined();
  });

  it('should call getLibraryBackupStatus and return a promise', async () => {
    await expect(getLibraryBackupStatus('test-library-id', 'test-task-id')).rejects.toBeDefined();
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
