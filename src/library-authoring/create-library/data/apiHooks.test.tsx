import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { mockContentLibrary } from '@src/library-authoring/data/api.mocks';
import { initializeMocks } from '@src/testUtils';
import { libraryAuthoringQueryKeys } from '../../data/apiHooks';
import {
  useCreateLibraryRestore,
  useCreateLibraryV2,
  useGetLibraryRestoreStatus,
} from './apiHooks';
import { LibraryRestoreStatus } from './restoreConstants';

mockContentLibrary.applyMock();
const { axiosMock, queryClient } = initializeMocks();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('create library apiHooks', () => {
  beforeEach(() => {
    queryClient.clear();
    axiosMock.reset();
  });

  describe('useCreateLibraryV2', () => {
    it('should create library and invalidate queries', async () => {
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

      // Mock the API call
      axiosMock.onPost('http://localhost:18010/api/libraries/v2/').reply(200, expectedResult);

      // Spy on query invalidation
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateLibraryV2(), { wrapper });

      await result.current.mutateAsync(libraryData);

      expect(axiosMock.history.post[0].url).toEqual('http://localhost:18010/api/libraries/v2/');
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        description: '',
        ...libraryData,
      });

      // Check that queries are invalidated on success
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: libraryAuthoringQueryKeys.contentLibraryList(),
      });
    });
  });

  describe('useCreateLibraryRestore', () => {
    it('should restore library from file', async () => {
      const file = new File(['test content'], 'test.tar.gz', { type: 'application/gzip' });
      const expectedResult = { taskId: 'test-task-id' };

      axiosMock.onPost('http://localhost:18010/api/libraries/v2/restore/').reply(200, expectedResult);

      const { result } = renderHook(() => useCreateLibraryRestore(), { wrapper });

      const response = await result.current.mutateAsync(file);

      expect(axiosMock.history.post[0].url).toEqual('http://localhost:18010/api/libraries/v2/restore/');
      expect(axiosMock.history.post[0].data).toBeInstanceOf(FormData);
      expect(response).toEqual(expectedResult);
    });

    it('should handle restore error', async () => {
      const file = new File(['test content'], 'test.tar.gz', { type: 'application/gzip' });

      axiosMock.onPost('http://localhost:18010/api/libraries/v2/restore/').reply(400, 'Bad Request');

      const { result } = renderHook(() => useCreateLibraryRestore(), { wrapper });

      await expect(result.current.mutateAsync(file)).rejects.toThrow();
    });
  });

  describe('useGetLibraryRestoreStatus', () => {
    it('should get restore status when taskId is provided', async () => {
      const taskId = 'test-task-id';
      const expectedResult = {
        state: LibraryRestoreStatus.Succeeded,
        result: {
          learningPackageId: 123,
          title: 'Test Library',
          org: 'test-org',
          slug: 'test-library',
          key: 'lib:test-org:test-library',
          archiveKey: 'archive-key',
          containers: 1,
          components: 5,
          collections: 2,
          sections: 1,
          subsections: 1,
          units: 1,
          createdOnServer: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: {
            username: 'testuser',
            email: 'test@example.com',
          },
        },
        error: null,
        errorLog: null,
      };

      axiosMock.onGet(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`).reply(200, expectedResult);

      const { result } = renderHook(() => useGetLibraryRestoreStatus(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy();
      });

      expect(result.current.data).toEqual(expectedResult);
      expect(axiosMock.history.get[0].url).toEqual(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`);
    });

    it('should not make request when taskId is empty', async () => {
      const { result } = renderHook(() => useGetLibraryRestoreStatus(''), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy();
      });

      expect(result.current.data).toBeUndefined();
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should handle pending status with refetch interval', async () => {
      const taskId = 'pending-task-id';
      const pendingResult = {
        state: LibraryRestoreStatus.Pending,
        result: null,
        error: null,
        error_log: null,
      };

      const expectedResult = {
        state: LibraryRestoreStatus.Pending,
        result: null,
        error: null,
        errorLog: null,
      };

      axiosMock.onGet(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`).reply(200, pendingResult);

      const { result } = renderHook(() => useGetLibraryRestoreStatus(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy();
      });

      expect(result.current.data).toEqual(expectedResult);
      expect(axiosMock.history.get[0].url).toEqual(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`);
    });

    it('should handle failed status', async () => {
      const taskId = 'failed-task-id';
      const failedResult = {
        state: LibraryRestoreStatus.Failed,
        result: null,
        error: 'Restore failed',
        error_log: 'Error details here',
      };

      const expectedResult = {
        state: LibraryRestoreStatus.Failed,
        result: null,
        error: 'Restore failed',
        errorLog: 'Error details here',
      };

      axiosMock.onGet(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`).reply(200, failedResult);

      const { result } = renderHook(() => useGetLibraryRestoreStatus(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalsy();
      });

      expect(result.current.data).toEqual(expectedResult);
      expect(axiosMock.history.get[0].url).toEqual(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`);
    });

    it('should handle API error', async () => {
      const taskId = 'error-task-id';

      axiosMock.onGet(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`).reply(404, 'Not Found');

      const { result } = renderHook(() => useGetLibraryRestoreStatus(taskId), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBeTruthy();
      });

      expect(result.current.data).toBeUndefined();
      expect(axiosMock.history.get[0].url).toEqual(`http://localhost:18010/api/libraries/v2/restore/?task_id=${taskId}`);
    });
  });
});
