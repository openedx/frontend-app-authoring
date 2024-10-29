import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import fetchMock from 'fetch-mock-jest';

import mockResult from './__mocks__/block-types.json';
import { mockContentSearchConfig } from './api.mock';
import {
  useGetBlockTypes,
} from './apiHooks';

mockContentSearchConfig.applyMock();

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

const fetchMockResponse = () => {
  fetchMock.post(
    mockContentSearchConfig.searchEndpointUrl,
    () => mockResult,
    { overwriteRoutes: true },
  );
};

describe('search manager api hooks', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('it should return block types facet', async () => {
    fetchMockResponse();
    const { result } = renderHook(() => useGetBlockTypes('filter'), { wrapper });
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
    const expectedData = {
      chapter: 1,
      html: 2,
      problem: 16,
      vertical: 2,
      video: 1,
    };
    expect(result.current.data).toEqual(expectedData);
    expect(fetchMock.calls().length).toEqual(1);
  });
});
