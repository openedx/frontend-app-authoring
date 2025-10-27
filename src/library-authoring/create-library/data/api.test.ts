import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { createLibraryV2, createLibraryRestore, getLibraryRestoreStatus } from './api';

let axiosMock: MockAdapter;

describe('create library api', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create library', async () => {
    const libraryData = {
      title: 'Test Library',
      org: 'test-org',
      slug: 'test-library',
      learning_package: 1,
    };
    const expectedResult = {
      id: 'lib:test-org:test-library',
      title: 'Test Library',
      org: 'test-org',
      slug: 'test-library',
    };

    axiosMock.onPost().reply(200, expectedResult);

    const result = await createLibraryV2(libraryData);

    expect(axiosMock.history.post[0].url).toEqual('http://localhost:18010/api/libraries/v2/');
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      description: '',
      ...libraryData,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should restore library from file', async () => {
    const file = new File(['test content'], 'test.tar.gz', { type: 'application/gzip' });
    const expectedResult = { task_id: 'test-task-id' };

    axiosMock.onPost().reply(200, expectedResult);

    const result = await createLibraryRestore(file);

    expect(axiosMock.history.post[0].url).toEqual('http://localhost:18010/api/libraries/v2/restore/');
    expect(axiosMock.history.post[0].data).toBeInstanceOf(FormData);
    expect(result).toEqual(expectedResult);
  });

  it('should get library restore status', async () => {
    const taskId = 'test-task-id';
    const expectedResult = {
      state: 'success',
      result: { learning_package_id: 123 },
    };

    axiosMock.onGet().reply(200, expectedResult);

    const result = await getLibraryRestoreStatus(taskId);

    expect(axiosMock.history.get[0].url).toEqual(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`);
    expect(result).toEqual(expectedResult);
  });

  it('should throw error when createLibraryV2 fails', async () => {
    const libraryData = {
      title: 'Test Library',
      org: 'test-org',
      slug: 'test-library',
    };

    axiosMock.onPost().reply(400, 'Bad Request');

    await expect(createLibraryV2(libraryData)).rejects.toThrow();
  });

  it('should throw error when createLibraryRestore fails', async () => {
    const file = new File(['test content'], 'test.tar.gz', { type: 'application/gzip' });

    axiosMock.onPost().reply(400, 'Bad Request');

    await expect(createLibraryRestore(file)).rejects.toThrow();
  });

  it('should throw error when getLibraryRestoreStatus fails', async () => {
    const taskId = 'test-task-id';

    axiosMock.onGet().reply(404, 'Not Found');

    await expect(getLibraryRestoreStatus(taskId)).rejects.toThrow();
  });

  it('should handle invalid parameters', async () => {
    // @ts-expect-error - testing invalid input
    await expect(createLibraryV2(null)).rejects.toThrow();

    // @ts-expect-error - testing invalid input
    await expect(createLibraryRestore(null)).rejects.toThrow();

    // @ts-expect-error - testing invalid input
    await expect(getLibraryRestoreStatus(null)).rejects.toThrow();
  });
});
