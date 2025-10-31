import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@src/testUtils';
import { initialState } from '@src/studio-home/factories/mockApiResponses';
import { RequestStatus } from '@src/data/constants';
import { type DeprecatedReduxState } from '@src/store';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { mockGetMigrationInfo } from '@src/studio-home/data/api.mocks';
import { getCourseDetailsApiUrl } from '@src/course-outline/data/api';
import { ImportStepperModal } from './ImportStepperModal';

let axiosMock;
mockGetMigrationInfo.applyMock();
type StudioHomeState = DeprecatedReduxState['studioHome'];

const libraryKey = 'lib:org:lib1';
const mockOnClose = jest.fn();
const numPages = 1;
const coursesCount = studioHomeMock.courses.length;

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
      <ImportStepperModal
        libraryKey={libraryKey}
        onClose={mockOnClose}
        isOpen
      />,
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

    expect(mockOnClose).toHaveBeenCalled();
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
    await fireEvent.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    await waitFor(async () => expect(await screen.findByText(
      /managing risk in the information age is being analyzed for review prior to import/i,
    )).toBeInTheDocument());

    expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
    expect(screen.getByText('Import Details')).toBeInTheDocument();
    // The import details is loading
    expect(screen.getByText('The selected course is being analyzed for import and review')).toBeInTheDocument();
  });

  it('the course should remain selected on back', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nextButton = await screen.findByRole('button', { name: /next step/i });
    expect(nextButton).toBeDisabled();

    // Select a course
    const courseCard = screen.getAllByRole('radio')[0];
    await fireEvent.click(courseCard);
    expect(courseCard).toBeChecked();

    // Click next
    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    const backButton = await screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(screen.getByText(/managing risk in the information age/i)).toBeInTheDocument();
    expect(courseCard).toBeChecked();
  });
});
