import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import fetchMock from 'fetch-mock-jest';
import type { Store } from 'redux';

import { getContentSearchConfigUrl } from '../../search-manager/data/api';
import { SearchContextProvider } from '../../search-manager/SearchManager';
import mockEmptyResult from '../../search-modal/__mocks__/empty-search-result.json';
import initializeStore from '../../store';
import LibraryCollections from './LibraryCollections';

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

const mockFetchNextPage = jest.fn();
const mockUseSearchContext = jest.fn();
const mockUseContentLibrary = jest.fn();

const data = {
  totalHits: 1,
  hits: [],
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: mockFetchNextPage,
  searchKeywords: '',
  isFiltered: false,
  isLoading: false,
};

let store: Store;
let axiosMock: MockAdapter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const returnEmptyResult = (_url: string, req) => {
  const requestData = JSON.parse(req.body?.toString() ?? '');
  const query = requestData?.queries[0]?.q ?? '';
  // We have to replace the query (search keywords) in the mock results with the actual query,
  // because otherwise we may have an inconsistent state that causes more queries and unexpected results.
  mockEmptyResult.results[0].query = query;
  // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  mockEmptyResult.results[0]?.hits.forEach((hit: any) => { hit._formatted = { ...hit }; });
  return mockEmptyResult;
};

jest.mock('../data/apiHooks', () => ({
  useContentLibrary: () => mockUseContentLibrary(),
}));

jest.mock('../../search-manager', () => ({
  ...jest.requireActual('../../search-manager'),
  useSearchContext: () => mockUseSearchContext(),
}));

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

(global as any).BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const RootWrapper = (props) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <SearchContextProvider>
          <LibraryCollections {...props} />
        </SearchContextProvider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<LibraryCollections />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    mockUseSearchContext.mockReturnValue(data);

    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });

    // The API method to get the Meilisearch connection details uses Axios:
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(getContentSearchConfigUrl()).reply(200, {
      url: 'http://mock.meilisearch.local',
      index_name: 'studio',
      api_key: 'test-key',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render a spinner while loading', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      isLoading: true,
    });

    render(<RootWrapper />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
