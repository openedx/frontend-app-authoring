import fetchMock from 'fetch-mock-jest';

import {
  render,
  screen,
  initializeMocks,
} from '../testUtils';
import { getContentSearchConfigUrl } from '../search-manager/data/api';
import { mockContentLibrary } from './data/api.mocks';
import mockEmptyResult from '../search-modal/__mocks__/empty-search-result.json';
import { LibraryProvider } from './common/context';
import LibraryHome from './LibraryHome';

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

mockContentLibrary.applyMock();
const mockFetchNextPage = jest.fn();
const mockUseSearchContext = jest.fn();

const data = {
  totalContentAndCollectionHits: 0,
  contentAndCollectionHits: [],
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: mockFetchNextPage,
  searchKeywords: '',
  isFiltered: false,
  isLoading: false,
};

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

jest.mock('../search-manager', () => ({
  ...jest.requireActual('../search-manager'),
  useSearchContext: () => mockUseSearchContext(),
}));

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

(global as any).BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const withLibraryId = (libraryId: string) => ({
  extraWrapper: ({ children }: { children: React.ReactNode }) => (
    <LibraryProvider libraryId={libraryId}>{children}</LibraryProvider>
  ),
});

describe('<LibraryHome />', () => {
  beforeEach(() => {
    const { axiosMock } = initializeMocks();

    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });

    // The API method to get the Meilisearch connection details uses Axios:
    axiosMock.onGet(getContentSearchConfigUrl()).reply(200, {
      url: 'http://mock.meilisearch.local',
      index_name: 'studio',
      api_key: 'test-key',
    });
  });

  afterEach(() => {
    fetchMock.reset();
    mockFetchNextPage.mockReset();
  });

  it('should render a spinner while loading', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      isLoading: true,
    });

    render(<LibraryHome />, withLibraryId(mockContentLibrary.libraryId));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render a load more button when there are more pages', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      totalContentAndCollectionHits: 1,
      hasNextPage: true,
    });

    render(<LibraryHome />, withLibraryId(mockContentLibrary.libraryId));
    expect(screen.getByText('Show more results')).toBeInTheDocument();
  });

  it('should render an empty state when there are no results', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      totalHits: 0,
    });
    render(<LibraryHome />, withLibraryId(mockContentLibrary.libraryId));
    expect(screen.getByText('You have not added any content to this library yet.')).toBeInTheDocument();
  });
});
