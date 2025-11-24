import { act, ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useValidateUserPermissions } from './hooks';

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
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return wrapper;
};

const permissions = [
  {
    action: 'act:read',
    object: 'lib:test-lib',
    scope: 'org:OpenedX',
  },
];

const mockValidPermissions = [
  { action: 'act:read', object: 'lib:test-lib', allowed: true },
];

const mockInvalidPermissions = [
  { action: 'act:read', object: 'lib:test-lib', allowed: false },
];

describe('useValidateUserPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns allowed true when permissions are valid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValueOnce({ data: mockValidPermissions }),
    });

    const { result } = renderHook(() => useValidateUserPermissions(permissions), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data![0].allowed).toBe(true);
  });

  it('returns allowed false when permissions are invalid', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockInvalidPermissions }),
    });

    const { result } = renderHook(() => useValidateUserPermissions(permissions), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current).toBeDefined());
    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(result.current.data![0].allowed).toBe(false);
  });

  it('handles error when the API call fails', async () => {
    const mockError = new Error('API Error');

    getAuthenticatedHttpClient.mockReturnValue({
      post: jest.fn().mockRejectedValue(new Error('API Error')),
    });

    try {
      act(() => {
        renderHook(() => useValidateUserPermissions(permissions), {
          wrapper: createWrapper(),
        });
      });
    } catch (error) {
      expect(error).toEqual(mockError); // Check for the expected error
    }
  });
});
