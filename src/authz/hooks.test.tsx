import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import * as authzApi from '@src/authz/data/api';
import { PermissionValidationQuery } from '@src/authz/types';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useUserPermissionsWithAuthzCourse } from './hooks';

jest.mock('@src/data/api');
jest.mock('@src/authz/data/api');

const mockedAuthzApi = jest.mocked(authzApi);

describe('useUserPermissionsWithAuthzCourse', () => {
  let queryClient: QueryClient;

  const createWrapper = () => function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  const mockPermissions: PermissionValidationQuery = {
    canViewFiles: {
      action: 'course.view_files',
      scope: 'course-v1:Test+101+2023',
    },
    canManageFiles: {
      action: 'course.manage_files',
      scope: 'course-v1:Test+101+2023',
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  it('returns all permissions as true when authz is disabled', async () => {
    mockWaffleFlags({
      enableAuthzCourseAuthoring: false,
    });

    const { result } = renderHook(
      () => useUserPermissionsWithAuthzCourse('course-v1:Test+101+2023', mockPermissions),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthzEnabled).toBe(false);
    expect(result.current.permissions.canViewFiles).toBe(true);
    expect(result.current.permissions.canManageFiles).toBe(true);
  });

  it('returns loading state when authz is enabled and permissions are loading', async () => {
    mockWaffleFlags({
      enableAuthzCourseAuthoring: true,
    });

    mockedAuthzApi.validateUserPermissions.mockImplementation(
      () => new Promise(() => {}),
    );

    const { result } = renderHook(
      () => useUserPermissionsWithAuthzCourse('course-v1:Test+101+2023', mockPermissions),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isAuthzEnabled).toBe(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('returns actual permission values when authz is enabled and permissions loaded', async () => {
    mockWaffleFlags({
      enableAuthzCourseAuthoring: true,
    });

    mockedAuthzApi.validateUserPermissions.mockResolvedValue({
      canViewFiles: true,
      canManageFiles: false,
    });

    const { result } = renderHook(
      () => useUserPermissionsWithAuthzCourse('course-v1:Test+101+2023', mockPermissions),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthzEnabled).toBe(true);
    expect(result.current.permissions.canViewFiles).toBe(true);
    expect(result.current.permissions.canManageFiles).toBe(false);
  });

  it('falls back to false for undefined permissions when authz is enabled', async () => {
    mockWaffleFlags({
      enableAuthzCourseAuthoring: true,
    });

    mockedAuthzApi.validateUserPermissions.mockResolvedValue({
      canViewFiles: true,
    });

    const { result } = renderHook(
      () => useUserPermissionsWithAuthzCourse('course-v1:Test+101+2023', mockPermissions),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthzEnabled).toBe(true);
    expect(result.current.permissions.canViewFiles).toBe(true);
    expect(result.current.permissions.canManageFiles).toBe(false);
  });
});
