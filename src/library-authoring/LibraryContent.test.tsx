import fetchMock from 'fetch-mock-jest';

import { getContentSearchConfigUrl } from '@src/search-manager/data/api';
import {
  fireEvent,
  render,
  screen,
  initializeMocks,
} from '@src/testUtils';

import MockAdapter from 'axios-mock-adapter/types';
import { useGetContentHits } from '@src/search-manager';
import { mockContentLibrary } from './data/api.mocks';
import mockEmptyResult from '../search-modal/__mocks__/empty-search-result.json';
import { LibraryProvider } from './common/context/LibraryContext';
import LibraryContent from './LibraryContent';
import { libraryComponentsMock } from './__mocks__';
import { getModulestoreMigratedBlocksInfoUrl } from './data/api';

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
  isPending: false,
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

jest.mock('@src/search-manager', () => ({
  ...jest.requireActual('../search-manager'),
  useSearchContext: () => mockUseSearchContext(),
  useGetContentHits: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

const withLibraryId = (libraryId: string) => ({
  extraWrapper: ({ children }: { children: React.ReactNode }) => (
    <LibraryProvider libraryId={libraryId}>
      {children}
    </LibraryProvider>
  ),
});
let axiosMock: MockAdapter;

describe('<LibraryHome />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;

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
      isPending: true,
    });

    render(<LibraryContent />, withLibraryId(mockContentLibrary.libraryId));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render an empty state when there are no results', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      totalHits: 0,
    });
    render(<LibraryContent />, withLibraryId(mockContentLibrary.libraryId));
    expect(screen.getByText('You have not added any content to this library yet.')).toBeInTheDocument();
  });

  it('should load more results when the user scrolls to the bottom', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      hasNextPage: true,
    });
    render(<LibraryContent />, withLibraryId(mockContentLibrary.libraryId));

    Object.defineProperty(window, 'innerHeight', { value: 800 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1600 });

    fireEvent.scroll(window, { target: { scrollY: 1000 } });
    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('should show placeholderBlocks', async () => {
    axiosMock.onGet(getModulestoreMigratedBlocksInfoUrl()).reply(200, [
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@library_content+block@test_lib_content',
        targetKey: null,
        unsupportedReason: 'The "library_content" XBlock (ID: "test_lib_content") has children, so it is not supported in content libraries. It has 2 children blocks.',
      },
      {
        sourceKey: 'block-v1:UNIX+UX2+2025_T2+type@conditional+block@test_conditional',
        targetKey: null,
        unsupportedReason: 'The "conditional" XBlock (ID: "test_conditional") has children, so it is not supported in content libraries. It has 2 children blocks.',
      },
    ]);
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [
          {
            display_name: 'Randomized Content Block',
            usage_key: 'block-v1:UNIX+UX2+2025_T2+type@library_content+block@test_lib_content',
            block_type: 'library_content',
          },
          {
            display_name: 'Conditional',
            usage_key: 'block-v1:UNIX+UX2+2025_T2+type@conditional+block@test_conditional',
            block_type: 'conditional',
          },
        ],
        query: '',
        processingTimeMs: 0,
        limit: 2,
        offset: 0,
        estimatedTotalHits: 2,
      },
    });
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
    });
    render(<LibraryContent />, withLibraryId(mockContentLibrary.libraryId));
    expect(await screen.findByText('Randomized Content Block')).toBeInTheDocument();
    expect(await screen.findByText('Conditional')).toBeInTheDocument();
  });
});
