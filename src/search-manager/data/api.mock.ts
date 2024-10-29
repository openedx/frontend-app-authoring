/* istanbul ignore file */
// eslint-disable-next-line import/no-extraneous-dependencies
import fetchMock from 'fetch-mock-jest';
import type { MultiSearchResponse } from 'meilisearch';
import * as api from './api';

/**
 * Mock getContentSearchConfig()
 */
export async function mockContentSearchConfig(): ReturnType<typeof api.getContentSearchConfig> {
  return {
    url: 'http://mock.meilisearch.local',
    indexName: 'studio',
    apiKey: 'test-key',
  };
}
mockContentSearchConfig.searchEndpointUrl = 'http://mock.meilisearch.local/multi-search';
mockContentSearchConfig.applyMock = () => (
  jest.spyOn(api, 'getContentSearchConfig').mockImplementation(mockContentSearchConfig)
);

/**
 * Mock all future Meilisearch searches with the given response.
 *
 * For a given test suite, this mock will stay in effect until you call it with
 * a different mock response, or you call `fetchMock.mockReset()`
 */
export function mockSearchResult(mockResponse: MultiSearchResponse) {
  fetchMock.post(mockContentSearchConfig.searchEndpointUrl, (_url, req) => {
    const requestData = JSON.parse(req.body?.toString() ?? '');
    const query = requestData?.queries[0]?.q ?? '';
    // We have to replace the query (search keywords) in the mock results with the actual query,
    // because otherwise Instantsearch will update the UI and change the query,
    // leading to unexpected results in the test cases.
    const newMockResponse = { ...mockResponse };
    newMockResponse.results[0].query = query;
    // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    mockResponse.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
    return newMockResponse;
  }, { overwriteRoutes: true });
}

/**
 * Mock the block types returned by the API.
 */
export async function mockGetBlockTypes(
  mockResponse: 'noBlocks' | 'someBlocks' | 'moreBlocks',
) {
  const mockResponseMap = {
    noBlocks: {},
    someBlocks: { problem: 1, html: 2 },
    moreBlocks: {
      advanced: 8,
      discussion: 7,
      library: 6,
      drag_and_drop_v2: 5,
      openassessment: 4,
      html: 3,
      problem: 2,
      video: 1,
    },
  };
  jest.spyOn(api, 'fetchBlockTypes').mockResolvedValue(mockResponseMap[mockResponse]);
}
mockGetBlockTypes.applyMock = () => jest.spyOn(api, 'fetchBlockTypes').mockResolvedValue({});
