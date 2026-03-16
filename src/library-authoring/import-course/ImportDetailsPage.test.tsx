import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render as testRender,
  screen,
  waitFor,
} from '@src/testUtils';
import { mockGetMigrationStatus } from '@src/data/api.mocks';
import { bulkModulestoreMigrateUrl } from '@src/data/api';
import { useGetContentHits } from '@src/search-manager';
import { ImportDetailsPage } from './ImportDetailsPage';
import { LibraryProvider } from '../common/context/LibraryContext';
import { mockContentLibrary, mockGetModulestoreMigratedBlocksInfo } from '../data/api.mocks';
import { libraryComponentsMock } from '../__mocks__';

mockContentLibrary.applyMock();
mockGetMigrationStatus.applyMock();
const { libraryId } = mockContentLibrary;
const mockNavigate = jest.fn();
const mockUseSearchContext = jest.fn();
const mockFetchNextPage = jest.fn();
let axiosMock;

// Mock the useCourseDetails hook
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseDetails: jest.fn().mockReturnValue({ isPending: false, data: { title: 'Test Course' } }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@src/search-manager', () => ({
  ...jest.requireActual('@src/search-manager'),
  useSearchContext: () => mockUseSearchContext(),
  useGetContentHits: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

const render = (migrationTaskId: string) => (
  testRender(
    <ImportDetailsPage />,
    {
      extraWrapper: ({ children }: { children: React.ReactNode }) => (
        <LibraryProvider libraryId={libraryId}>
          {children}
        </LibraryProvider>
      ),
      path: '/libraries/:libraryId/import/:courseId/:migrationTaskId',
      params: {
        libraryId,
        migrationTaskId,
        courseId: '1',
      },
    },
  )
);

describe('<ImportDetailsPage />', () => {
  beforeEach(() => {
    const newMocks = initializeMocks();
    axiosMock = newMocks.axiosMock;
  });

  it('should render loading state', () => {
    render(mockGetMigrationStatus.migrationIdLoading);
    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/help & support/i)).toBeInTheDocument();
  });

  it('should render In Progress state', async () => {
    render(mockGetMigrationStatus.migrationIdInProgress);
    expect(await screen.findByText(/test course is being imported/i));
    expect(screen.getByRole('button', {
      name: /view imported content/i,
    })).toBeDisabled();
  });

  it('should render Failed state', async () => {
    const user = userEvent.setup();
    const url = bulkModulestoreMigrateUrl();
    axiosMock.onPost(url).reply(200);
    render(mockGetMigrationStatus.migrationIdFailed);
    expect(await screen.findByText(/test course was not imported into your Library/i));
    expect(screen.getByText(/import failed for the following reasons:/i));
    const retryImport = screen.getByRole('button', {
      name: /re-try import/i,
    });

    await user.click(retryImport);
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
  });

  it('should render Succeeded state', async () => {
    mockGetModulestoreMigratedBlocksInfo.applyMockSuccess();
    render(mockGetMigrationStatus.migrationId);
    expect(await screen.findByText(
      /test course has been imported to your library in a collection called test collection/i,
    ));
    expect(await screen.findByText(/Total Blocks/i)).toBeInTheDocument();
    expect(await screen.findByText('4')).toBeInTheDocument();

    const viewImportedContentBtn = screen.getByRole('button', {
      name: /view imported content/i,
    });

    viewImportedContentBtn.click();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/library/lib:Axim:TEST/collection/coll'));
  });

  it('should render Partial Succeeded state', async () => {
    const user = userEvent.setup();
    mockGetModulestoreMigratedBlocksInfo.applyMockPartial();
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [
          {
            display_name: 'Randomized Content Block',
            usage_key: 'block-v1:UNIX+UX2+2025_T2+type@library_content+block@test_lib_content',
            block_type: 'library_content',
          },
        ],
        query: '',
        processingTimeMs: 0,
        limit: 1,
        offset: 0,
        estimatedTotalHits: 1,
      },
    });
    mockUseSearchContext.mockReturnValue({
      totalContentAndCollectionHits: 0,
      contentAndCollectionHits: [],
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      searchKeywords: '',
      isFiltered: false,
      isPending: false,
      hits: libraryComponentsMock,
    });

    render(mockGetMigrationStatus.migrationId);
    expect(await screen.findByText(/partial import successful/i)).toBeInTheDocument();

    expect(await screen.findByText(/Total Blocks/i)).toBeInTheDocument();
    expect(await screen.findByText('2/3')).toBeInTheDocument();
    expect(await screen.findByText(/Components/i)).toBeInTheDocument();
    expect(await screen.findByText('1/2')).toBeInTheDocument();

    expect(await screen.findByText(
      /66% of course test course has been imported successfully/i,
    )).toBeInTheDocument();

    expect(await screen.findByRole('cell', {
      name: /randomized content block/i,
    })).toBeInTheDocument();
    expect(await screen.findByRole('cell', {
      name: 'library_content',
    })).toBeInTheDocument();
    expect(await screen.findByRole('cell', {
      name: /has children, so it is not supported in content libraries/i,
    })).toBeInTheDocument();

    const viewImportedContentBtn = screen.getByRole('button', {
      name: /view imported content/i,
    });

    await user.click(viewImportedContentBtn);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/library/lib:Axim:TEST/collection/coll'));
  });
});
