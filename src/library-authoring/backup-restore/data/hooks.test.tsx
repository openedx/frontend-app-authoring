import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { initializeMocks } from '@src/testUtils';
import { LibraryBackupStatus } from './constants';
import { useGetLibraryBackupStatus, useCreateLibraryBackup } from './hooks';

// Mock API functions
jest.mock('@src/library-authoring/backup-restore/data/api', () => ({
  createLibraryBackup: jest.fn(async () => ({ task_id: 'task-abc' })),
  getLibraryBackupStatus: jest.fn(async (_libraryId: string, _taskId: string) => ({
    state: LibraryBackupStatus.Pending,
    url: '',
  })),
}));

const { createLibraryBackup, getLibraryBackupStatus } = jest.requireMock('@src/library-authoring/backup-restore/data/api');

describe('backup-restore hooks', () => {
  const libraryId = 'lib:Org:example';

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
    jest.clearAllMocks();
  });

  it('useGetLibraryBackupStatus does not fetch when taskId is empty', async () => {
    const wrapper = createWrapper();
    renderHook(() => useGetLibraryBackupStatus(libraryId, ''), { wrapper });
    // Allow microtasks to flush to prevent false positives
    await new Promise(res => setTimeout(res, 0));
    expect(getLibraryBackupStatus).not.toHaveBeenCalled();
  });

  it('useGetLibraryBackupStatus fetches when taskId provided and sets data to Pending', async () => {
    const wrapper = createWrapper();
    const taskId = 'task-123';
    const { result } = renderHook(() => useGetLibraryBackupStatus(libraryId, taskId), { wrapper });
    await waitFor(() => {
      expect(getLibraryBackupStatus).toHaveBeenCalledWith(libraryId, taskId);
      expect(result.current.data).toBeDefined();
    });
    expect(result.current.data?.state).toBe(LibraryBackupStatus.Pending);
  });

  it('useCreateLibraryBackup mutation returns task id', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateLibraryBackup(libraryId), { wrapper });
    await result.current.mutateAsync();
    expect(createLibraryBackup).toHaveBeenCalledWith(libraryId);
  });
});
