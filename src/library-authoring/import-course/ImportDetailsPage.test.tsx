import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render as testRender,
  screen,
  waitFor,
} from '@src/testUtils';
import { mockGetMigrationStatus } from '@src/data/api.mocks';
import { bulkModulestoreMigrateUrl } from '@src/data/api';
import { ImportDetailsPage } from './ImportDetailsPage';
import { LibraryProvider } from '../common/context/LibraryContext';
import { mockContentLibrary } from '../data/api.mocks';

mockContentLibrary.applyMock();
mockGetMigrationStatus.applyMock();
const { libraryId } = mockContentLibrary;
const mockNavigate = jest.fn();
let axiosMock;

// Mock the useCourseDetails hook
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseDetails: jest.fn().mockReturnValue({ isPending: false, data: { title: 'Test Course' } }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

describe('', () => {
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
    render(mockGetMigrationStatus.migrationId);
    expect(await screen.findByText(
      /test course has been imported to your library in a collection called test collection/i,
    ));

    const viewImportedContentBtn = screen.getByRole('button', {
      name: /view imported content/i,
    });

    await viewImportedContentBtn.click();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/library/lib:Axim:TEST/collection/coll'));
  });

  it('should render Partial Succeeded state', async () => {
    render(mockGetMigrationStatus.migrationIdPartial);
    expect(await screen.findByText(/partial import successful/i)).toBeInTheDocument();

    expect(screen.getByText(
      /85% of course test course has been imported successfully/i,
    )).toBeInTheDocument();

    expect(screen.getByRole('cell', {
      name: /legacy library content/i,
    })).toBeInTheDocument();
    expect(screen.getByRole('cell', {
      name: /library_content/i,
    })).toBeInTheDocument();
    expect(screen.getByRole('cell', {
      name: /the block has children, so it is not supported in content libraries/i,
    }));

    const viewImportedContentBtn = screen.getByRole('button', {
      name: /view imported content/i,
    });

    await viewImportedContentBtn.click();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/library/lib:Axim:TEST/collection/coll'));
  });
});
