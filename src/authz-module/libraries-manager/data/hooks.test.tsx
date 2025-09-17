import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useTeamMembers } from './hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as api from './api';


const mockMembers = [
  {
    name: 'Alice',
    username: 'user1',
    email: 'alice@example.com',
    roles: ['admin', 'author'],
  },
  {
    name: 'Bob',
    username: 'user2',
    email: 'bob@example.com',
    roles: ['collaborator'],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for predictable test results
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTeamMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data when API call succeeds', async () => {
    jest.spyOn(api, 'getTeamMembers').mockResolvedValue(mockMembers);

    const { result } = renderHook(() => useTeamMembers('lib123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.getTeamMembers).toHaveBeenCalledWith('lib123');
    expect(result.current.data).toEqual(mockMembers);
  });

  it('handles error when API call fails', async () => {
    // Mock failed API call
    jest
      .spyOn(api, 'getTeamMembers')
      .mockRejectedValue(new Error('API failure'));

    const { result } = renderHook(() => useTeamMembers('lib123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(api.getTeamMembers).toHaveBeenCalledWith('lib123');
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
