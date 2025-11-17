import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import { useMigrationInfo } from '@src/library-authoring/data/apiHooks';
import { useGetBlockTypes } from '@src/search-manager';
import { render as baseRender, screen, initializeMocks } from '@src/testUtils';
import { LibraryProvider } from '@src/library-authoring/common/context/LibraryContext';
import { mockContentLibrary } from '@src/library-authoring/data/api.mocks';
import { ReviewImportDetails } from './ReviewImportDetails';
import messages from '../messages';

mockContentLibrary.applyMock();
const { libraryId } = mockContentLibrary;

// Mock the useCourseDetails hook
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseDetails: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

// Mock the useMigrationInfo hook
jest.mock('@src/library-authoring/data/apiHooks', () => ({
  useMigrationInfo: jest.fn().mockReturnValue({ isPending: true, data: null }),
  useContentLibrary: jest.fn().mockReturnValue({}),
}));

// Mock the useGetBlockTypes hook
jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

const render = (element: React.ReactElement) => {
  const params: { libraryId: string } = { libraryId };
  return baseRender(element, {
    path: '/libraries/:libraryId/import/course',
    params,
    extraWrapper: ({ children }) => (
      <LibraryProvider
        libraryId={libraryId}
      >
        { children }
      </LibraryProvider>
    ),
  });
};

describe('ReviewImportDetails', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders loading spinner when isPending is true', async () => {
    render(<ReviewImportDetails courseId="test-course-id" />);

    const spinners = await screen.findAllByRole('status');
    spinners.every((spinner) => expect(spinner.textContent).toEqual('Loading...'));
  });

  it('renders import progress status when isBlockDataPending or migrationInfoIsPending is true', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: true,
      data: null,
    });

    render(<ReviewImportDetails courseId="test-course-id" />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(/Import Analysis in Progress/i)).toBeInTheDocument();
  });

  it('renders warning when reimport', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        'test-course-id': [{
          targetKey: libraryId,
          targetTitle: 'Library title',
        }],
      },
    });
    (useGetBlockTypes as jest.Mock).mockReturnValue({
      isPending: false,
      data: { html: 1 },
    });

    render(<ReviewImportDetails courseId="test-course-id" />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(/Import Analysis Completed: Reimport/i)).toBeInTheDocument();
    expect(await screen.findByText(
      messages.importCourseAnalysisCompleteReimportBody.defaultMessage
        .replace('{courseName}', 'Test Course')
        .replace('{libraryName}', 'Library title'),
    )).toBeInTheDocument();
  });

  it('renders warning when unsupportedBlockPercentage > 0', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: false,
      data: null,
    });
    (useGetBlockTypes as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        chapter: 1,
        sequential: 2,
        vertical: 3,
        'problem-builder': 1,
        html: 1,
      },
    });

    render(<ReviewImportDetails courseId="test-course-id" />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(/Import Analysis Complete/i)).toBeInTheDocument();
    expect(await screen.findByText(
      /12.50% of content cannot be imported. For details see below./i,
    )).toBeInTheDocument();
    expect(await screen.findByText(/Total Blocks/i)).toBeInTheDocument();
    expect(await screen.findByText('7/8')).toBeInTheDocument();
    expect(await screen.findByText('Sections')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('Subsections')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('Units')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(await screen.findByText('Components')).toBeInTheDocument();
    expect(await screen.findByText('1/2')).toBeInTheDocument();
  });

  it('renders success alert when no unsupported blocks', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: false,
      data: null,
    });
    (useGetBlockTypes as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        chapter: 1,
        sequential: 2,
        vertical: 3,
        html: 5,
        problem: 3,
      },
    });

    render(<ReviewImportDetails courseId="test-course-id" />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(
      messages.importCourseAnalysisCompleteAllContentBody.defaultMessage
        .replace('{courseName}', 'Test Course'),
    )).toBeInTheDocument();
    expect(await screen.findByText(/Total Blocks/i)).toBeInTheDocument();
    expect(await screen.findByText('14')).toBeInTheDocument();
    expect(await screen.findByText('Sections')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('Subsections')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('Units')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(await screen.findByText('Components')).toBeInTheDocument();
    expect(await screen.findByText('8')).toBeInTheDocument();
  });
});
