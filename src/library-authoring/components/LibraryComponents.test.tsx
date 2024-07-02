import React from 'react';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import fetchMock from 'fetch-mock-jest';
import type { Store } from 'redux';

import { getContentSearchConfigUrl } from '../../search-modal/data/api';
import mockEmptyResult from '../../search-modal/__mocks__/empty-search-result.json';
import { SearchContextProvider } from '../../search-modal/manager/SearchManager';
import initializeStore from '../../store';
import { libraryComponentsMock } from '../__mocks__';
import LibraryComponents from './LibraryComponents';

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

const mockUseLibraryBlockTypes = jest.fn();
const mockFetchNextPage = jest.fn();
const mockUseSearchContext = jest.fn();

const data = {
  totalHits: 1,
  hits: [],
  isFetching: true,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: mockFetchNextPage,
  searchKeywords: '',
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

const blockTypeData = {
  data: [
    {
      blockType: 'html',
      displayName: 'Text',
    },
    {
      blockType: 'video',
      displayName: 'Video',
    },
    {
      blockType: 'problem',
      displayName: 'Problem',
    },
  ],
};

jest.mock('../data/apiHook', () => ({
  useLibraryBlockTypes: () => mockUseLibraryBlockTypes(),
}));

jest.mock('../../search-modal/manager/SearchManager', () => ({
  ...jest.requireActual('../../search-modal/manager/SearchManager'),
  useSearchContext: () => mockUseSearchContext(),
}));

const RootWrapper = (props) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <SearchContextProvider>
          <LibraryComponents libraryId="1" {...props} />
        </SearchContextProvider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<LibraryComponents />', () => {
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
    mockUseLibraryBlockTypes.mockReturnValue(blockTypeData);
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

  it('should render empty state', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      totalHits: 0,
    });

    render(<RootWrapper />);
    expect(await screen.findByText(/you have not added any content to this library yet\./i));
  });

  it('should render loading', async () => {
    render(<RootWrapper />);
    expect((await screen.findAllByTestId('card-loading'))[0]).toBeInTheDocument();
  });

  it('should render components in full variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
    });
    render(<RootWrapper variant="full" />);

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a text: ID=2')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=3')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=4')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=5')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=6')).toBeInTheDocument();
  });

  it('should render components in preview variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
    });
    render(<RootWrapper variant="preview" />);

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a text: ID=2')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=3')).toBeInTheDocument();
    expect(screen.getByText('This is a video: ID=4')).toBeInTheDocument();
    expect(screen.queryByText('This is a problem: ID=5')).not.toBeInTheDocument();
    expect(screen.queryByText('This is a problem: ID=6')).not.toBeInTheDocument();
  });

  it('should call `fetchNextPage` on scroll to bottom in full variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
      hasNextPage: true,
    });

    render(<RootWrapper variant="full" />);

    Object.defineProperty(window, 'innerHeight', { value: 800 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1600 });

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('should not call `fetchNextPage` on croll to bottom in preview variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: false,
      hasNextPage: true,
    });

    render(<RootWrapper variant="preview" />);

    Object.defineProperty(window, 'innerHeight', { value: 800 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1600 });

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('should render content and loading when fetching next page', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      isFetching: true,
      isFetchingNextPage: true,
      hasNextPage: true,
    });

    render(<RootWrapper variant="full" />);

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=6')).toBeInTheDocument();

    expect((await screen.findAllByTestId('card-loading'))[0]).toBeInTheDocument();
  });
});
