import { initializeMocks, renderHook, waitFor } from '@src/testUtils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as api from '@src/library-authoring/backup-restore/data/api';
import { LibraryBackupStatus } from './constants';
import { useCreateLibraryBackup, useGetLibraryBackupStatus } from './hooks';

describe('backup-restore hooks', () => {
  const libraryId = 'lib:Org:example';
  let createLibraryBackupSpy: jest.SpyInstance;
  let getLibraryBackupStatusSpy: jest.SpyInstance;

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return function namingToMakeEslintHappy({ children }: { children: React.ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  };

  beforeEach(() => {
    initializeMocks();
    createLibraryBackupSpy = jest.spyOn(api, 'createLibraryBackup').mockImplementation(async () => ({ task_id: 'task-abc' }));
    getLibraryBackupStatusSpy = jest.spyOn(api, 'getLibraryBackupStatus').mockImplementation(async () => ({
      state: LibraryBackupStatus.Pending,
      url: '',
    }));
  });

  afterEach(() => {
    createLibraryBackupSpy.mockRestore();
    getLibraryBackupStatusSpy.mockRestore();
  });

  it('useGetLibraryBackupStatus does not fetch when taskId is empty', async () => {
    const wrapper = createWrapper();
    renderHook(() => useGetLibraryBackupStatus(libraryId, ''), { wrapper });
    expect(getLibraryBackupStatusSpy).not.toHaveBeenCalled();
  });

  it('useGetLibraryBackupStatus fetches when taskId provided and sets data to Pending', async () => {
    const wrapper = createWrapper();
    const taskId = 'task-123';
    const { result } = renderHook(() => useGetLibraryBackupStatus(libraryId, taskId), { wrapper });
    await waitFor(() => {
      expect(getLibraryBackupStatusSpy).toHaveBeenCalledWith(libraryId, taskId);
      expect(result.current.data).toBeDefined();
    });
    expect(result.current.data?.state).toBe(LibraryBackupStatus.Pending);
  });

  it('useCreateLibraryBackup mutation returns task id', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateLibraryBackup(libraryId), { wrapper });
    await result.current.mutateAsync();
    expect(createLibraryBackupSpy).toHaveBeenCalledWith(libraryId);
  });
});
