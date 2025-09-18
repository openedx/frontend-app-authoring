import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLibrary, useTeamMembers, useValidateTeamMember } from './hooks';
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

const mockLibrary = {
  id: 'lib:123',
  org: 'demo-org',
  title: 'Test Library',
  slug: 'test-library',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for predictable test results
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider
      client={queryClient}
    >{children}
    </QueryClientProvider>
  );

  return wrapper;
};

describe('useTeamMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data when API call succeeds', async () => {
    jest.spyOn(api, 'getTeamMembers').mockResolvedValue(mockMembers);

    const { result } = renderHook(() => useTeamMembers('lib:123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.getTeamMembers).toHaveBeenCalledWith('lib:123');
    expect(result.current.data).toEqual(mockMembers);
  });

  it('handles error when API call fails', async () => {
    // Mock failed API call
    jest
      .spyOn(api, 'getTeamMembers')
      .mockRejectedValue(new Error('API failure'));

    const { result } = renderHook(() => useTeamMembers('lib:123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(api.getTeamMembers).toHaveBeenCalledWith('lib:123');
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});

describe('useValidateTeamMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user data on success', async () => {
    jest.spyOn(api, 'validateTeamMember').mockResolvedValue(mockMembers[0]);

    const { result } = renderHook(
      () => useValidateTeamMember('lib:123', 'user1'),
      {
        wrapper: createWrapper(),
      },
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(mockMembers[0]);
      expect(api.validateTeamMember).toHaveBeenCalledWith('lib:123', 'user1');
    });
  });

  it('throws on API failure', async () => {
    jest
      .spyOn(api, 'validateTeamMember')
      .mockRejectedValue(new Error('User not authorized'));

    const wrapper = createWrapper();
    try {
      renderHook(
        () => useValidateTeamMember('lib:123', 'user2'),
        { wrapper },
      );
    } catch (e) {
      expect(e).toEqual(new Error('User not authorized'));
    }

    expect(api.validateTeamMember).toHaveBeenCalledWith('lib:123', 'user2');
  });
});

describe('useLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns metadata on success', async () => {
    jest.spyOn(api, 'getLibrary').mockResolvedValue(mockLibrary);

    const { result } = renderHook(
      () => useLibrary('lib123'),
      { wrapper: createWrapper() },
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(mockLibrary);
      expect(api.getLibrary).toHaveBeenCalledWith('lib123');
    });
  });

  it('throws on error', () => {
    jest
      .spyOn(api, 'getLibrary')
      .mockRejectedValue(new Error('Not found'));

    const wrapper = createWrapper();
    try {
      renderHook(() => useLibrary('lib123'), { wrapper });
    } catch (e) {
      expect(e).toEqual(new Error('Not found'));
    }

    expect(api.getLibrary).toHaveBeenCalledWith('lib123');
  });
});
