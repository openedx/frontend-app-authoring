import { useSelector } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { RequestStatus } from '../data/constants';
import { COURSE_CREATOR_STATES } from '../constants';
import { studioHomeMock } from './__mocks__';
import { getStudioHomeApiUrl } from './data/api';
import {
  act,
  fireEvent,
  render,
  waitFor,
  initializeMocks,
} from '../testUtils';
import messages from './messages';
import createNewCourseMessages from './create-new-course-form/messages';
import createOrRerunCourseMessages from '../generic/create-or-rerun-course/messages';
import { StudioHome } from '.';

const {
  studioShortName,
  studioRequestEmail,
} = studioHomeMock;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => mockNavigate,
}));

const RootWrapper = () => (
  <MemoryRouter initialEntries={['/home']}>
    <Routes>
      <Route
        path="/home"
        element={<StudioHome />}
      />
      <Route
        path="/libraries"
        element={<StudioHome />}
      />
      <Route
        path="/libraries-v1"
        element={<StudioHome />}
      />
    </Routes>,
  </MemoryRouter>
);

describe('<StudioHome />', () => {
  describe('api fetch fails', () => {
    beforeEach(async () => {
      const mocks = initializeMocks();
      mocks.axiosMock.onGet(getStudioHomeApiUrl()).reply(404);
      useSelector.mockReturnValue({ studioHomeLoadingStatus: RequestStatus.FAILED });
    });

    it('should render fetch error', () => {
      const { getByText } = render(<RootWrapper />);
      waitFor(() => {
        expect(getByText(messages.homePageLoadFailedMessage.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should render Studio home title', () => {
      const { getByText } = render(<RootWrapper />);
      waitFor(() => {
        expect(getByText('Studio home')).toBeInTheDocument();
      });
    });
  });

  describe('api fetch succeeds', () => {
    beforeEach(async () => {
      const mocks = initializeMocks();
      mocks.axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
      useSelector.mockReturnValue(studioHomeMock);
    });

    it('should render page and page title correctly', () => {
      const { getByText } = render(<RootWrapper />);
      waitFor(() => {
        expect(getByText(`${studioShortName} home`)).toBeInTheDocument();
      });
    });

    it('should render email staff header button', async () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.disallowedForThisSite,
      });

      const { getByRole } = render(<RootWrapper />);
      waitFor(() => {
        expect(getByRole('link', { name: messages.emailStaffBtnText.defaultMessage }))
          .toHaveAttribute('href', `mailto:${studioRequestEmail}`);
      });
    });

    it('should render create new course button', async () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });

      const { getByRole } = render(<RootWrapper />);
      waitFor(() => {
        expect(getByRole('button', { name: messages.addNewCourseBtnText.defaultMessage })).toBeInTheDocument();
      });
    });

    it('should show verify email layout if user inactive', () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        userIsActive: false,
      });

      const { getByText } = render(<RootWrapper />);
      waitFor(() => {
        expect(getByText('Thanks for signing up, abc123!', { exact: false })).toBeInTheDocument();
      });
    });

    it('shows the spinner before the query is complete', async () => {
      useSelector.mockReturnValue({
        studioHomeLoadingStatus: RequestStatus.IN_PROGRESS,
        userIsActive: true,
      });

      await act(async () => {
        const { getByRole } = render(<RootWrapper />);
        waitFor(() => {
          const spinner = getByRole('status');
          expect(spinner.textContent).toEqual('Loading...');
        });
      });
    });

    describe('render new library button', () => {
      it('should navigate to home_library when libraries-v2 disabled', () => {
        useSelector.mockReturnValue({
          ...studioHomeMock,
          courseCreatorStatus: COURSE_CREATOR_STATES.granted,
          librariesV2Enabled: false,
        });
        const studioBaseUrl = 'http://localhost:18010';

        const { getByTestId } = render(<RootWrapper />);
        waitFor(() => {
          const createNewLibraryButton = getByTestId('new-library-button');

          const { open } = window;
          window.open = jest.fn();
          fireEvent.click(createNewLibraryButton);
          expect(window.open).toHaveBeenCalledWith(`${studioBaseUrl}/home_library`);
          window.open = open;
        });
      });

      it('should navigate to the library authoring page in course authoring', () => {
        useSelector.mockReturnValue({
          ...studioHomeMock,
          librariesV1Enabled: false,
        });
        const { getByTestId } = render(<RootWrapper />);
        waitFor(() => {
          const createNewLibraryButton = getByTestId('new-library-button');
          fireEvent.click(createNewLibraryButton);
          expect(mockNavigate).toHaveBeenCalledWith('/library/create');
        });
      });
    });

    it('do not render new library button for "v1 only" mode if showNewLibraryButton is False', () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        showNewLibraryButton: false,
        librariesV2Enabled: false,
      });
      const { queryByTestId } = render(<RootWrapper />);
      expect(queryByTestId('new-library-button')).not.toBeInTheDocument();
    });

    it('render new library button for "v2 only" mode even if showNewLibraryButton is False', () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        showNewLibraryButton: false,
        librariesV1Enabled: false,
      });
      const { queryByTestId } = render(<RootWrapper />);
      waitFor(() => {
        expect(queryByTestId('new-library-button')).toBeInTheDocument();
      });
    });

    it('should render create new course container', async () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });

      const { getByRole, getByText } = render(<RootWrapper />);
      waitFor(() => {
        const createNewCourseButton = getByRole('button', { name: messages.addNewCourseBtnText.defaultMessage });

        act(() => fireEvent.click(createNewCourseButton));
        expect(getByText(createNewCourseMessages.createNewCourse.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should hide create new course container', async () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });

      const { getByRole, queryByText, getByText } = render(<RootWrapper />);

      waitFor(() => {
        const createNewCourseButton = getByRole('button', { name: messages.addNewCourseBtnText.defaultMessage });
        fireEvent.click(createNewCourseButton);
        expect(getByText(createNewCourseMessages.createNewCourse.defaultMessage)).toBeInTheDocument();
      });

      waitFor(() => {
        const cancelButton = getByRole('button', { name: createOrRerunCourseMessages.cancelButton.defaultMessage });
        fireEvent.click(cancelButton);
        expect(queryByText(createNewCourseMessages.createNewCourse.defaultMessage)).not.toBeInTheDocument();
      });
    });

    describe('contact administrator card', () => {
      it('should show contact administrator card with no add course buttons', () => {
        useSelector.mockReturnValue({
          ...studioHomeMock,
          courses: null,
          courseCreatorStatus: COURSE_CREATOR_STATES.pending,
        });
        const { getByText, queryByText } = render(<RootWrapper />);
        const defaultTitleMessage = messages.defaultSection_1_Title.defaultMessage;
        waitFor(() => {
          const titleWithStudioName = defaultTitleMessage.replace('{studioShortName}', 'Studio');
          const administratorCardTitle = getByText(titleWithStudioName);

          expect(administratorCardTitle).toBeVisible();

          const addCourseButton = queryByText(messages.btnAddNewCourseText.defaultMessage);
          expect(addCourseButton).toBeNull();
        });
      });

      it('should show contact administrator card with add course buttons', () => {
        useSelector.mockReturnValue({
          ...studioHomeMock,
          courses: null,
          courseCreatorStatus: COURSE_CREATOR_STATES.granted,
        });
        const { getByText, getByTestId } = render(<RootWrapper />);
        const defaultTitleMessage = messages.defaultSection_1_Title.defaultMessage;
        waitFor(() => {
          const titleWithStudioName = defaultTitleMessage.replace('{studioShortName}', 'Studio');
          const administratorCardTitle = getByText(titleWithStudioName);

          expect(administratorCardTitle).toBeVisible();

          const addCourseButton = getByTestId('contact-admin-create-course');
          expect(addCourseButton).toBeVisible();

          fireEvent.click(addCourseButton);
          expect(getByTestId('create-course-form')).toBeVisible();
        });
      });
    });

    it('should show footer', () => {
      const { getByText } = render(<RootWrapper />);
      waitFor(() => {
        expect(getByText('Looking for help with Studio?')).toBeInTheDocument();
        expect(getByText('LMS')).toHaveAttribute('href', process.env.LMS_BASE_URL);
      });
    });
  });
});
