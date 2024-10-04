import fetchMock from 'fetch-mock-jest';

import {
  fireEvent,
  render,
  screen,
  initializeMocks,
} from '../../testUtils';
import { getContentSearchConfigUrl } from '../../search-manager/data/api';
import { mockLibraryBlockTypes, mockContentLibrary } from '../data/api.mocks';
import mockEmptyResult from '../../search-modal/__mocks__/empty-search-result.json';
import { LibraryProvider } from '../common/context';
import { libraryComponentsMock } from '../__mocks__';
import LibraryComponents from './LibraryComponents';

const searchEndpoint = 'http://mock.meilisearch.local/multi-search';

mockLibraryBlockTypes.applyMock();
mockContentLibrary.applyMock();
const mockFetchNextPage = jest.fn();
const mockUseSearchContext = jest.fn();

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

jest.mock('../../search-manager', () => ({
  ...jest.requireActual('../../search-manager'),
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

describe('<LibraryComponents />', () => {
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

  it('should render empty state', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      totalHits: 0,
    });

    render(<LibraryComponents variant="full" />, withLibraryId(mockContentLibrary.libraryId));
    expect(await screen.findByText(/you have not added any content to this library yet\./i));
    expect(await screen.findByRole('button', { name: /add component/i })).toBeInTheDocument();
  });

  it('should render empty state without add content button', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      totalHits: 0,
    });

    render(<LibraryComponents variant="full" />, withLibraryId(mockContentLibrary.libraryIdReadOnly));
    expect(await screen.findByText(/you have not added any content to this library yet\./i));
    expect(screen.queryByRole('button', { name: /add component/i })).not.toBeInTheDocument();
  });

  it('should render a spinner while loading', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      isLoading: true,
    });

    render(<LibraryComponents variant="full" />, withLibraryId(mockContentLibrary.libraryId));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render components in full variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
    });
    render(<LibraryComponents variant="full" />, withLibraryId(mockContentLibrary.libraryId));

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a text: ID=2')).toBeInTheDocument();
    expect(screen.getByText('Video Component 3')).toBeInTheDocument();
    expect(screen.getByText('Video Component 4')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=5')).toBeInTheDocument();
    expect(screen.getByText('This is a problem: ID=6')).toBeInTheDocument();
  });

  it('should render components in preview variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
    });
    render(<LibraryComponents variant="preview" />, withLibraryId(mockContentLibrary.libraryId));

    expect(await screen.findByText('This is a text: ID=1')).toBeInTheDocument();
    expect(screen.getByText('This is a text: ID=2')).toBeInTheDocument();
    expect(screen.getByText('Video Component 3')).toBeInTheDocument();
    expect(screen.getByText('Video Component 4')).toBeInTheDocument();
    expect(screen.queryByText('This is a problem: ID=5')).not.toBeInTheDocument();
    expect(screen.queryByText('This is a problem: ID=6')).not.toBeInTheDocument();
  });

  it('should call `fetchNextPage` on scroll to bottom in full variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      hasNextPage: true,
    });

    render(<LibraryComponents variant="full" />, withLibraryId(mockContentLibrary.libraryId));

    Object.defineProperty(window, 'innerHeight', { value: 800 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1600 });

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('should not call `fetchNextPage` on scroll to bottom in preview variant', async () => {
    mockUseSearchContext.mockReturnValue({
      ...data,
      hits: libraryComponentsMock,
      hasNextPage: true,
    });

    render(<LibraryComponents variant="preview" />, withLibraryId(mockContentLibrary.libraryId));

    Object.defineProperty(window, 'innerHeight', { value: 800 });
    Object.defineProperty(document.body, 'scrollHeight', { value: 1600 });

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });
});
