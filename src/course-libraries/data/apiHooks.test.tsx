import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';
import { getEntityLinksByDownstreamContextUrl } from './api';
import { useEntityLinks, useUnpaginatedEntityLinks } from './apiHooks';

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

  afterEach(() => {
    axiosMock.reset();
  });

  it('should return paginated links for course', async () => {
    const courseId = 'course-v1:some+key';
    const url = getEntityLinksByDownstreamContextUrl();
    const expectedResult = {
      next: null, results: [], previous: null, total: 0,
    };
    axiosMock.onGet(url).reply(200, expectedResult);
    const { result } = renderHook(() => useEntityLinks({ courseId }), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(result.current.data?.pages).toEqual([expectedResult]);
    expect(axiosMock.history.get[0].url).toEqual(url);
  });

  it('should return links for course', async () => {
    const courseId = 'course-v1:some+key';
    const url = getEntityLinksByDownstreamContextUrl();
    axiosMock.onGet(url).reply(200, []);
    const { result } = renderHook(() => useUnpaginatedEntityLinks({ courseId }), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    expect(axiosMock.history.get[0].url).toEqual(url);
    expect(axiosMock.history.get[0].params).toEqual({
      course_id: courseId,
      ready_to_sync: undefined,
      upstream_usage_key: undefined,
      no_page: true,
    });
  });
});
