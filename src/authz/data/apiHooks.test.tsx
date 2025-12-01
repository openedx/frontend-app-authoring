import { act, ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useUserPermissions } from './apiHooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
};

const singlePermission = {
  canRead: {
    action: 'act:read',
    scope: 'lib:test-lib',
  },
};

const mockValidSinglePermission = [
  { action: 'act:read', scope: 'lib:test-lib', allowed: true },
];

const mockInvalidSinglePermission = [
  { action: 'act:read', scope: 'lib:test-lib', allowed: false },
];

const mockEmptyPermissions = [
  // No permissions returned
];

const multiplePermissions = {
  canRead: {
    action: 'act:read',
    scope: 'lib:test-lib',
  },
  canWrite: {
    action: 'act:write',
    scope: 'lib:test-lib',
  },
};

const mockValidMultiplePermissions = [
  { action: 'act:read', scope: 'lib:test-lib', allowed: true },
  { action: 'act:write', scope: 'lib:test-lib', allowed: true },
];

const mockInvalidMultiplePermissions = [
  { action: 'act:read', scope: 'lib:test-lib', allowed: false },
  { action: 'act:write', scope: 'lib:test-lib', allowed: false },
];

describe('useUserPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns allowed true when permission is valid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValueOnce({ data: mockValidSinglePermission }),
    });

    const { result } = renderHook(() => useUserPermissions(singlePermission), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data!.canRead).toBe(true);
  });

  it('returns allowed false when permission is invalid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockInvalidSinglePermission }),
    });

    const { result } = renderHook(() => useUserPermissions(singlePermission), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current).toBeDefined());
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data!.canRead).toBe(false);
  });

  it('returns allowed true when multiple permissions are valid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValueOnce({ data: mockValidMultiplePermissions }),
    });

    const { result } = renderHook(() => useUserPermissions(multiplePermissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data!.canRead).toBe(true);
    expect(result.current.data!.canWrite).toBe(true);
  });

  it('returns allowed false when multiple permissions are invalid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockInvalidMultiplePermissions }),
    });

    const { result } = renderHook(() => useUserPermissions(multiplePermissions), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current).toBeDefined());
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data!.canRead).toBe(false);
    expect(result.current.data!.canWrite).toBe(false);
  });

  it('returns allowed false when the permission is not included in the server response', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockEmptyPermissions }),
    });

    const { result } = renderHook(() => useUserPermissions(singlePermission), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current).toBeDefined());
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data!.canRead).toBe(false);
  });

  it('handles error when the API call fails', async () => {
    const mockError = new Error('API Error');

    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockRejectedValue(new Error('API Error')),
    });

    try {
      act(() => {
        renderHook(() => useUserPermissions(singlePermission), {
          wrapper: createWrapper(),
        });
      });
    } catch (error) {
      expect(error).toEqual(mockError); // Check for the expected error
    }
  });
});
