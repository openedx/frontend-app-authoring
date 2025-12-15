import { useCourseDetails } from '@src/course-outline/data/apiHooks';
import { useLibraryBlockLimits, useMigrationInfo } from '@src/library-authoring/data/apiHooks';
import { useGetBlockTypes, useGetContentHits } from '@src/search-manager';
import { render as baseRender, screen, initializeMocks } from '@src/testUtils';
import { LibraryProvider } from '@src/library-authoring/common/context/LibraryContext';
import { mockContentLibrary } from '@src/library-authoring/data/api.mocks';
import { ReviewImportDetails } from './ReviewImportDetails';
import messages from '../messages';

mockContentLibrary.applyMock();
const { libraryId } = mockContentLibrary;
const markAnalysisComplete = jest.fn();
const setImportIsBlocked = jest.fn();

// Mock the useCourseDetails hook
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseDetails: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

// Mock the useMigrationInfo hook
jest.mock('@src/library-authoring/data/apiHooks', () => ({
  useMigrationInfo: jest.fn().mockReturnValue({ isPending: true, data: null }),
  useContentLibrary: jest.fn().mockReturnValue({}),
  useLibraryBlockLimits: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

// Mock the useGetBlockTypes hook
jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: jest.fn().mockReturnValue({ isPending: true, data: null }),
  useGetContentHits: jest.fn().mockReturnValue({ isPending: true, data: null }),
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
    (useLibraryBlockLimits as jest.Mock).mockReturnValue({
      isPending: false,
      data: { maxBlocksPerContentLibrary: 100 },
    });
    render(<ReviewImportDetails
      markAnalysisComplete={markAnalysisComplete}
      courseId="test-course-id"
      setImportIsBlocked={setImportIsBlocked}
    />);

    const spinners = await screen.findAllByRole('status');
    spinners.every((spinner) => expect(spinner.textContent).toEqual('Loading...'));
    expect(markAnalysisComplete).toHaveBeenCalledWith(false);
  });

  it('renders import progress status when isBlockDataPending or migrationInfoIsPending is true', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useLibraryBlockLimits as jest.Mock).mockReturnValue({
      isPending: false,
      data: { maxBlocksPerContentLibrary: 100 },
    });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: true,
      data: null,
    });

    render(<ReviewImportDetails
      markAnalysisComplete={markAnalysisComplete}
      courseId="test-course-id"
      setImportIsBlocked={setImportIsBlocked}
    />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(/Import Analysis in Progress/i)).toBeInTheDocument();
    expect(markAnalysisComplete).toHaveBeenCalledWith(false);
  });

  it('renders warning when reimport', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useLibraryBlockLimits as jest.Mock).mockReturnValue({
      isPending: false,
      data: { maxBlocksPerContentLibrary: 100 },
    });
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

    render(<ReviewImportDetails
      markAnalysisComplete={markAnalysisComplete}
      courseId="test-course-id"
      setImportIsBlocked={setImportIsBlocked}
    />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(/Import Analysis Completed: Reimport/i)).toBeInTheDocument();
    expect(await screen.findByText(
      messages.importCourseAnalysisCompleteReimportBody.defaultMessage
        .replace('{courseName}', 'Test Course')
        .replace('{libraryName}', 'Library title'),
    )).toBeInTheDocument();
    expect(markAnalysisComplete).toHaveBeenCalledWith(true);
  });

  it('renders warning when unsupportedBlockPercentage > 0', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useLibraryBlockLimits as jest.Mock).mockReturnValue({
      isPending: false,
      data: { maxBlocksPerContentLibrary: 100 },
    });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: false,
      data: null,
    });
    (useGetBlockTypes as jest.Mock).mockImplementation((args) => {
      // Block types query for children of unsupported blocks
      if (args.length === 2) {
        return {
          isPending: false,
          data: {},
        };
      }

      // Block types query from the course
      if (args[0] === 'context_key = "test-course-id"') {
        return {
          isPending: false,
          data: {
            chapter: 1,
            sequential: 2,
            vertical: 3,
            'problem-builder': 1,
            html: 1,
          },
        };
      }

      return {
        isPending: true,
        data: null,
      };
    });

    render(<ReviewImportDetails
      markAnalysisComplete={markAnalysisComplete}
      courseId="test-course-id"
      setImportIsBlocked={setImportIsBlocked}
    />);

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
    expect(markAnalysisComplete).toHaveBeenCalledWith(true);
  });

  it('renders warning when components exceed the limit', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useLibraryBlockLimits as jest.Mock).mockReturnValue({
      isPending: false,
      data: { maxBlocksPerContentLibrary: 20 },
    });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: false,
      data: null,
    });
    (useGetBlockTypes as jest.Mock).mockImplementation((args) => {
      // Block types query for children of unsupported blocks
      if (args.length === 2) {
        return {
          isPending: false,
          data: {},
        };
      }

      // Block types query from the course
      if (args[0] === 'context_key = "test-course-id"') {
        return {
          isPending: false,
          data: {
            chapter: 1,
            sequential: 2,
            vertical: 3,
            'problem-builder': 1,
            html: 25,
          },
        };
      }

      return {
        isPending: true,
        data: null,
      };
    });

    render(<ReviewImportDetails
      markAnalysisComplete={markAnalysisComplete}
      courseId="test-course-id"
      setImportIsBlocked={setImportIsBlocked}
    />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(/Import Blocked/i)).toBeInTheDocument();
    expect(await screen.findByText(
      /This import would exceed the Content Library limit of 20 items/i,
    )).toBeInTheDocument();
    expect(markAnalysisComplete).toHaveBeenCalledWith(true);
    expect(setImportIsBlocked).toHaveBeenCalledWith(true);
  });

  it('considers children blocks of unsupportedBlocks', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useLibraryBlockLimits as jest.Mock).mockReturnValue({
      isPending: false,
      data: { maxBlocksPerContentLibrary: 100 },
    });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: false,
      data: null,
    });
    (useGetContentHits as jest.Mock).mockReturnValue({
      isPending: false,
      data: {
        hits: [{ usage_key: 'some-usage-key' }],
        estimatedTotalHits: 1,
      },
    });
    (useGetBlockTypes as jest.Mock).mockImplementation((args) => {
      // Block types query for children of unsupported blocks
      if (args.length === 2) {
        return {
          isPending: false,
          data: {
            problem: 2,
          },
        };
      }

      // Block types query from the course
      if (args[0] === 'context_key = "test-course-id"') {
        return {
          isPending: false,
          data: {
            chapter: 1,
            sequential: 2,
            vertical: 3,
            library_content: 1,
            html: 1,
            problem: 4,
          },
        };
      }

      return {
        isPending: true,
        data: null,
      };
    });

    render(<ReviewImportDetails
      markAnalysisComplete={markAnalysisComplete}
      courseId="test-course-id"
      setImportIsBlocked={setImportIsBlocked}
    />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await screen.findByText(/Import Analysis Complete/i)).toBeInTheDocument();
    expect(await screen.findByText(
      /25.00% of content cannot be imported. For details see below./i,
    )).toBeInTheDocument();
    expect(await screen.findByText(/Total Blocks/i)).toBeInTheDocument();
    expect(await screen.findByText('9/12')).toBeInTheDocument();
    expect(await screen.findByText('Sections')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('Subsections')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('Units')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(await screen.findByText('Components')).toBeInTheDocument();
    expect(await screen.findByText('3/6')).toBeInTheDocument();
    expect(markAnalysisComplete).toHaveBeenCalledWith(true);
  });

  it('renders success alert when no unsupported blocks', async () => {
    (useCourseDetails as jest.Mock).mockReturnValue({ isPending: false, data: { title: 'Test Course' } });
    (useLibraryBlockLimits as jest.Mock).mockReturnValue({
      isPending: false,
      data: { maxBlocksPerContentLibrary: 100 },
    });
    (useMigrationInfo as jest.Mock).mockReturnValue({
      isPending: false,
      data: null,
    });
    (useGetBlockTypes as jest.Mock).mockImplementation((args) => {
      // Block types query for children of unsupported blocks
      if (args.length === 2) {
        return {
          isPending: false,
          data: {},
        };
      }

      // Block types query from the course
      if (args[0] === 'context_key = "test-course-id"') {
        return {
          isPending: false,
          data: {
            chapter: 1,
            sequential: 2,
            vertical: 3,
            html: 5,
            problem: 3,
          },
        };
      }

      return {
        isPending: true,
        data: null,
      };
    });

    render(<ReviewImportDetails
      markAnalysisComplete={markAnalysisComplete}
      courseId="test-course-id"
      setImportIsBlocked={setImportIsBlocked}
    />);

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
    expect(markAnalysisComplete).toHaveBeenCalledWith(true);
  });
});
