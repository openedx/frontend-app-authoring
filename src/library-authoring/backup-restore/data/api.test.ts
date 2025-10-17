// eslint-disable-next-line import/no-extraneous-dependencies
import { getLibraryBackupApiUrl, getLibraryBackupStatusApiUrl } from '@src/library-authoring/data/api';
import { mockContentLibrary } from '@src/library-authoring/data/api.mocks';
import { initializeMocks } from '@src/testUtils';
import { createLibraryBackup, getLibraryBackupStatus } from './api';

mockContentLibrary.applyMock();
const { axiosMock } = initializeMocks();

afterEach(() => {
  axiosMock.reset();
});

describe('backup-restore api', () => {
  it('should call createLibraryBackup and return a promise', async () => {
    await expect(createLibraryBackup(mockContentLibrary.libraryId)).rejects.toBeDefined();
  });

  it('should build correct URL and call post for createLibraryBackup', async () => {
    const libraryUrl = getLibraryBackupApiUrl(mockContentLibrary.libraryId);
    axiosMock.onPost(libraryUrl).reply(200, { success: true, taskId: 'task123' });
    const result = await createLibraryBackup(mockContentLibrary.libraryId);

    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].url).toMatch(libraryUrl);
    expect(result).toEqual({ success: true, taskId: 'task123' });
  });

  it('should call getLibraryBackupStatus and return a promise', async () => {
    await expect(getLibraryBackupStatus('test-library-id', 'test-task-id')).rejects.toBeDefined();
  });

  it('should build correct URL and call get for getLibraryBackupStatus', async () => {
    axiosMock.onGet().reply(200, { status: 'ok' });
    const result = await getLibraryBackupStatus(mockContentLibrary.libraryId, 'task123');
    expect(axiosMock.history.get.length).toBe(1);
    expect(axiosMock.history.get[0].url).toMatch(getLibraryBackupStatusApiUrl(mockContentLibrary.libraryId, 'task123'));
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
    await expect(getLibraryBackupStatus(mockContentLibrary.libraryId)).rejects.toBeDefined();
  });
});
