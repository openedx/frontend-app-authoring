import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock-jest';

import mockResult from './__mocks__/block-types.json';
import { mockContentSearchConfig, mockGetContentHits } from './api.mock';
import * as api from './api';
import {
  useGetBlockTypes,
  useGetContentHits,
} from './apiHooks';

mockContentSearchConfig.applyMock();

let queryClient: QueryClient;

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const fetchMockResponse = () => {
  fetchMock.post(
    mockContentSearchConfig.multisearchEndpointUrl,
    () => mockResult,
    { overwriteRoutes: true },
  );
};

const mockSplitIndexes = () => {
  jest.spyOn(api, 'getContentSearchConfig').mockResolvedValue({
    url: 'http://mock.meilisearch.local',
    courseIndexName: 'studio_course',
    libraryIndexName: 'studio_library',
    apiKey: 'test-key',
  });
};

describe('search manager api hooks', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(() => {
    fetchMock.reset();
    mockContentSearchConfig.applyMock();
  });

  it('it should return block types facet', async () => {
    fetchMockResponse();
    const { result } = renderHook(() => useGetBlockTypes('filter', 'course'), { wrapper });
    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
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

  it('useGetContentHits should return hits', async () => {
    mockGetContentHits('someHits');
    const { result } = renderHook(() => useGetContentHits('filter', 'course'), { wrapper });
    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
    });
    const expectedData = {
      hits: [{ usage_key: 'some-key' }, { usage_key: 'other-key' }],
      estimatedTotalHits: 2,
    };
    expect(result.current.data).toEqual(expectedData);
  });

  it.each(
    [
      ['course', 'studio_course'],
      ['library', 'studio_library'],
    ] as const,
  )('useGetBlockTypes searches the %s index', async (indexType, expectedIndex) => {
    mockSplitIndexes();
    fetchMockResponse();
    const { result } = renderHook(() => useGetBlockTypes('filter', indexType), { wrapper });
    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy();
    });
    const body = JSON.parse(fetchMock.lastCall()![1]!.body as string);
    expect(body.queries.map((q) => q.indexUid)).toEqual([expectedIndex]);
  });

  it.each(
    [
      ['course', 'studio_course'],
      ['library', 'studio_library'],
    ] as const,
  )('useGetContentHits searches the %s index', async (indexType, expectedIndex) => {
    mockSplitIndexes();
    fetchMock.post(`http://mock.meilisearch.local/indexes/${expectedIndex}/search`, {
      hits: [],
      estimatedTotalHits: 0,
    });
    const { result } = renderHook(() => useGetContentHits('filter', indexType), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    expect(fetchMock.calls().length).toEqual(1);
  });
});
