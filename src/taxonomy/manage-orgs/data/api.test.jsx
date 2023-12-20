import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MockAdapter from 'axios-mock-adapter';

import {
  getManageOrgsApiUrl,
  useManageOrgs,

} from './api';

let axiosMock;

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

describe('import taxonomy api calls', () => {
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
    jest.clearAllMocks();
  });

  it('should call update taxonomy orgs', async () => {
    axiosMock.onPut(getManageOrgsApiUrl(1)).reply(200);
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useManageOrgs(), { wrapper });

    await result.current.mutateAsync({ taxonomyId: 1, orgs: ['org1', 'org2'], allOrgs: false });
    expect(axiosMock.history.put[0].url).toEqual(getManageOrgsApiUrl(1));
    expect(axiosMock.history.put[0].data).toEqual(JSON.stringify({ all_orgs: false, orgs: ['org1', 'org2'] }));
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['taxonomyList'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['taxonomyDetail', 1],
    });
  });

  it('should call update taxonomy orgs with allOrgs', async () => {
    axiosMock.onPut(getManageOrgsApiUrl(1)).reply(200);
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useManageOrgs(), { wrapper });

    await result.current.mutateAsync({ taxonomyId: 1, orgs: ['org1', 'org2'], allOrgs: true });
    expect(axiosMock.history.put[0].url).toEqual(getManageOrgsApiUrl(1));
    // Should not send orgs when allOrgs is true
    expect(axiosMock.history.put[0].data).toEqual(JSON.stringify({ all_orgs: true }));
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['taxonomyList'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['taxonomyDetail', 1],
    });
  });
});
