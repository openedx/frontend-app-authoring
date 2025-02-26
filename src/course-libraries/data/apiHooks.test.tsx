import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';
import { getEntityLinksByDownstreamContextUrl } from './api';
import { useEntityLinks } from './apiHooks';

let axiosMock: MockAdapter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('course libraries api hooks', () => {
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

  it('should create library block', async () => {
    const courseKey = 'course-v1:some+key';
    const url = getEntityLinksByDownstreamContextUrl(courseKey);
    axiosMock.onGet(url).reply(200, []);
    const { result } = renderHook(() => useEntityLinks(courseKey), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(result.current.data).toEqual([]);
    expect(axiosMock.history.get[0].url).toEqual(url);
  });
});
