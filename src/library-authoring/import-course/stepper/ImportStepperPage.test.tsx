import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import { initialState } from '@src/studio-home/factories/mockApiResponses';
import { RequestStatus } from '@src/data/constants';
import { type DeprecatedReduxState } from '@src/store';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { getCourseDetailsApiUrl } from '@src/course-outline/data/api';
import { LibraryProvider } from '@src/library-authoring/common/context/LibraryContext';
import { mockContentLibrary, mockGetMigrationInfo } from '@src/library-authoring/data/api.mocks';
import { bulkModulestoreMigrateUrl } from '@src/data/api';
import { mockGetPreviewModulestoreMigration } from '@src/data/api.mocks';
import { ImportStepperPage } from './ImportStepperPage';

let axiosMock;
mockGetMigrationInfo.applyMock();
mockContentLibrary.applyMock();
mockGetPreviewModulestoreMigration.applyMock();
type StudioHomeState = DeprecatedReduxState['studioHome'];

const libraryKey = mockContentLibrary.libraryId;
const numPages = 1;
const coursesCount = studioHomeMock.courses.length;

const courses = [
  {
    courseKey: mockGetPreviewModulestoreMigration.sourceKeyGood,
    displayName: 'Managing Risk in the Information Age',
    lmsLink: '//localhost:18000/courses/course-v1:HarvardX+123+2023/jump_to/block-v1:HarvardX+123+2023+type@course+block@course',
    number: '123',
    org: 'HarvardX',
    rerunLink: '/course_rerun/course-v1:HarvardX+123+2023',
    run: '2023',
    url: '/course/course-v1:HarvardX+123+2023',
  },
  {
    courseKey: mockGetPreviewModulestoreMigration.sourceKeyBlockLimit,
    displayName: 'Course with a lot of components',
    lmsLink: '//localhost:18000/courses/course-v1:HarvardX+123+2023/jump_to/block-v1:HarvardX+123+2023+type@course+block@course',
    number: '3',
    org: 'HarvardX',
    rerunLink: '/course_rerun/course-v1:HarvardX+123+2023',
    run: '2023',
    url: '/course/course-v1:HarvardX+123+2023',
  },
  {
    courseKey: mockGetPreviewModulestoreMigration.sourceKeyBlockLoading,
    displayName: 'Course with a loading',
    lmsLink: '//localhost:18000/courses/course-v1:HarvardX+123+2023/jump_to/block-v1:HarvardX+123+2023+type@course+block@course',
    number: '4',
    org: 'HarvardX',
    rerunLink: '/course_rerun/course-v1:HarvardX+123+2023',
    run: '2023',
    url: '/course/course-v1:HarvardX+123+2023',
  },
];

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useGetBlockTypes hook
jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: jest.fn().mockReturnValue({ isPending: true, data: null }),
  useGetContentHits: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

const renderComponent = (studioHomeState: Partial<StudioHomeState> = {}) => {
  // Generate a custom initial state based on studioHomeCoursesRequestParams
  const customInitialState: Partial<DeprecatedReduxState> = {
    ...initialState,
    studioHome: {
      ...initialState.studioHome,
      studioHomeData: {
        courses,
        numPages,
        coursesCount,
      },
      loadingStatuses: {
        ...initialState.studioHome.loadingStatuses,
        courseLoadingStatus: RequestStatus.SUCCESSFUL,
      },
      ...studioHomeState,
    },
  };

  // Initialize the store with the custom initial state
  const newMocks = initializeMocks({ initialState: customInitialState });
  const store = newMocks.reduxStore;
  axiosMock = newMocks.axiosMock;

  return {
    ...render(
      <ImportStepperPage />,
      {
        extraWrapper: ({ children }: { children: React.ReactNode }) => (
          <LibraryProvider libraryId={libraryKey}>
            {children}
          </LibraryProvider>
        ),
        path: '/libraries/:libraryId/import/course',
        params: { libraryId: libraryKey },
      },
    ),
    store,
  };
};

describe('<ImportStepperModal />', () => {
  it('should render correctly', async () => {
    const user = userEvent.setup();
    renderComponent();
    // Renders the stepper header
    expect(await screen.findByText('Select Course')).toBeInTheDocument();
    expect(await screen.findByText('Review Import Details')).toBeInTheDocument();

    // Hides previously imported courses.
    expect(screen.queryByText(/managing risk in the information age/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Previously Imported')).not.toBeInTheDocument();

    // use filter modal to show previously imported courses.
    await user.click(await screen.findByRole('button', { name: 'Filter settings' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Show Previously Imported Courses' }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));

    // Renders previously imported courses and badge
    expect(await screen.findByText(/managing risk in the information age/i)).toBeInTheDocument();
    expect(await screen.findByText('Previously Imported')).toBeInTheDocument();

    // Renders cancel and next step buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
  });

  it('should cancel the import', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButon = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButon);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should go to review import details step', async () => {
    const user = userEvent.setup();
    renderComponent();
    const courseId = mockGetPreviewModulestoreMigration.sourceKeyBlockLoading;
    axiosMock.onGet(getCourseDetailsApiUrl(courseId)).reply(200, {
      courseId,
      title: 'Managing Risk in the Information Age',
      subtitle: '',
      org: 'HarvardX',
      description: 'This is a test course',
    });

    // use filter modal to show previously imported courses.
    await user.click(await screen.findByRole('button', { name: 'Filter settings' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Show Previously Imported Courses' }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));

    const nextButton = await screen.findByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();

    // Select a course
    const courseCard = screen.getAllByRole('radio')[2];
    await user.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    await waitFor(async () => expect(await screen.findByText(
      /managing risk in the information age is being analyzed for review prior to import/i,
    )).toBeInTheDocument());

    expect(await screen.findByText('Analysis Summary')).toBeInTheDocument();
    // The import details is loading
    expect(await screen.findByText('Import Analysis in Progress')).toBeInTheDocument();
  });

  it('should block import when content limit is reached', async () => {
    const user = userEvent.setup();
    renderComponent();
    const courseId = mockGetPreviewModulestoreMigration.sourceKeyBlockLimit;
    axiosMock.onGet(getCourseDetailsApiUrl(courseId)).reply(200, {
      courseId,
      title: 'Managing Risk in the Information Age',
      subtitle: '',
      org: 'HarvardX',
      description: 'This is a test course',
    });

    const nextButton = await screen.findByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();

    // Select a course
    const courseCard = screen.getAllByRole('radio')[0];
    await user.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    expect(await screen.findByText(/Import Blocked/i)).toBeInTheDocument();
    expect(await screen.findByText(
      /This import would exceed the Content Library limit of 1000 items/i,
    )).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /import course/i })).toBeDisabled();
  });

  it('the course should remain selected on back only for non-imported courses', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nextButton = await screen.findByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();

    // Select a course
    const courseCard = (await screen.findAllByRole('radio'))[0];
    await user.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    const backButton = await screen.findByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(courseCard).toBeChecked();
    expect(nextButton).toBeEnabled();
  });

  it('should hide previously imported courses on page change', async () => {
    const user = userEvent.setup();
    renderComponent();

    // use filter modal to show previously imported courses.
    await user.click(await screen.findByRole('button', { name: 'Filter settings' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Show Previously Imported Courses' }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));

    const nextButton = await screen.findByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();

    // Select a course
    const courseCard = (await screen.findAllByRole('radio'))[0];
    await user.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    const backButton = await screen.findByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(screen.queryByText(/managing risk in the information age/i)).not.toBeInTheDocument();
    expect((await screen.findAllByRole('radio'))[0]).not.toBeChecked();

    // should be disabled
    expect(await screen.findByRole('button', { name: /next step/i })).toBeDisabled();
  });

  it('should reset checkbox if modal is closed or cancelled without saving', async () => {
    const user = userEvent.setup();
    renderComponent();

    // use filter modal to show previously imported courses.
    await user.click(await screen.findByRole('button', { name: 'Filter settings' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Show Previously Imported Courses' }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    await user.click(await screen.findByRole('button', { name: 'Filter settings' }));
    const checkbox = await screen.findByRole('checkbox', { name: 'Show Previously Imported Courses' });
    expect(checkbox).not.toBeChecked();
  });

  it('should import selected course on button click', async () => {
    const user = userEvent.setup();
    renderComponent();

    // use filter modal to show previously imported courses.
    await user.click(await screen.findByRole('button', { name: 'Filter settings' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Show Previously Imported Courses' }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));

    axiosMock.onPost(bulkModulestoreMigrateUrl()).reply(200);
    const courseId = mockGetPreviewModulestoreMigration.sourceKeyGood;
    axiosMock.onGet(getCourseDetailsApiUrl(courseId)).reply(200, {
      courseId,
      title: 'Managing Risk in the Information Age',
      subtitle: '',
      org: 'HarvardX',
      description: 'This is a test course',
    });

    const nextButton = await screen.findByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();

    // Select a course
    const courseCard = screen.getAllByRole('radio')[0];
    await user.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    expect(await screen.findByText('Analysis Summary')).toBeInTheDocument();
    // Analysis completed
    expect(await screen.findByText('Import Analysis Completed: Reimport')).toBeInTheDocument();
    const importBtn = await screen.findByRole('button', { name: 'Import Course' });
    await user.click(importBtn);

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });
    expect(axiosMock.history.post[0].data).toBe(
      '{"sources":["course-v1:HarvardX+123+2023"],"target":"lib:Axim:TEST","create_collections":true,"repeat_handling_strategy":"fork","composition_level":"section"}',
    );
  });
});
