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
import { useGetBlockTypes } from '@src/search-manager';
import { bulkModulestoreMigrateUrl } from '@src/data/api';
import { ImportStepperPage } from './ImportStepperPage';

let axiosMock;
mockGetMigrationInfo.applyMock();
mockContentLibrary.applyMock();
type StudioHomeState = DeprecatedReduxState['studioHome'];

const libraryKey = mockContentLibrary.libraryId;
const numPages = 1;
const coursesCount = studioHomeMock.courses.length;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useGetBlockTypes hook
jest.mock('@src/search-manager', () => ({
  useGetBlockTypes: jest.fn().mockReturnValue({ isPending: true, data: null }),
}));

const renderComponent = (studioHomeState: Partial<StudioHomeState> = {}) => {
  // Generate a custom initial state based on studioHomeCoursesRequestParams
  const customInitialState: Partial<DeprecatedReduxState> = {
    ...initialState,
    studioHome: {
      ...initialState.studioHome,
      studioHomeData: {
        courses: studioHomeMock.courses,
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
    renderComponent();
    // Renders the stepper header
    expect(await screen.findByText('Select Course')).toBeInTheDocument();
    expect(await screen.findByText('Review Import Details')).toBeInTheDocument();

    // Renders the course list and previously imported chip
    expect(screen.getByText(/managing risk in the information age/i)).toBeInTheDocument();
    expect(screen.getByText(/run 0/i)).toBeInTheDocument();
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
    axiosMock.onGet(getCourseDetailsApiUrl('course-v1:HarvardX+123+2023')).reply(200, {
      courseId: 'course-v1:HarvardX+123+2023',
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

    await waitFor(async () => expect(await screen.findByText(
      /managing risk in the information age is being analyzed for review prior to import/i,
    )).toBeInTheDocument());

    expect(await screen.findByText('Analysis Summary')).toBeInTheDocument();
    // The import details is loading
    expect(await screen.findByText('Import Analysis in Progress')).toBeInTheDocument();
  });

  it('the course should remain selected on back', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nextButton = await screen.findByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();

    // Select a course
    const courseCard = screen.getAllByRole('radio')[0];
    await user.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    const backButton = await screen.findByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(screen.getByText(/managing risk in the information age/i)).toBeInTheDocument();
    expect(courseCard).toBeChecked();
  });

  it('should import select course on button click', async () => {
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
    const user = userEvent.setup();
    renderComponent();
    axiosMock.onPost(bulkModulestoreMigrateUrl()).reply(200);
    axiosMock.onGet(getCourseDetailsApiUrl('course-v1:HarvardX+123+2023')).reply(200, {
      courseId: 'course-v1:HarvardX+123+2023',
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
