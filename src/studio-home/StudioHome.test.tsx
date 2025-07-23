import * as reactRedux from 'react-redux';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  initializeMocks,
  within,
} from '@src/testUtils';
import { RequestStatus } from '../data/constants';
import { COURSE_CREATOR_STATES } from '../constants';
import studioHomeMock from './__mocks__/studioHomeMock';
import { getStudioHomeApiUrl } from './data/api';
import { StudioHome } from '.';

const {
  studioShortName,
  studioRequestEmail,
} = studioHomeMock;

const mockUseSelector = jest.fn();
jest.spyOn(reactRedux, 'useSelector').mockImplementation(mockUseSelector);
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

/** Helper function to get the Studio header in the rendered HTML */
function getHeaderElement(): HTMLElement {
  const header = screen.getByRole('banner');
  expect(header.tagName).toEqual('HEADER');
  return header;
}

describe('<StudioHome />', () => {
  describe('api fetch fails', () => {
    beforeEach(async () => {
      const mocks = initializeMocks();
      mocks.axiosMock.onGet(getStudioHomeApiUrl()).reply(404);
      mockUseSelector.mockReturnValue({ studioHomeLoadingStatus: RequestStatus.FAILED });
    });

    it('should render fetch error', async () => {
      render(<StudioHome />, { path: '/home' });
      expect(screen.getByText('Failed to load Studio home. Please try again later.')).toBeInTheDocument();
    });

    it('should render Studio home title', async () => {
      render(<StudioHome />, { path: '/home' });
      // Search only within the header; don't match on the similar text in the body's error message.
      const header = getHeaderElement();
      expect(within(header).getByText('Studio home')).toBeInTheDocument();
    });
  });

  describe('api fetch succeeds', () => {
    beforeEach(async () => {
      const mocks = initializeMocks();
      mocks.axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
      mockUseSelector.mockReturnValue(studioHomeMock);
    });

    it('should render page and page title correctly', async () => {
      render(<StudioHome />, { path: '/home' });
      const header = getHeaderElement();
      expect(within(header).getByText(`${studioShortName} home`)).toBeInTheDocument();
    });

    it('should render "email staff" header button for users without create permission', async () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.disallowedForThisSite,
      });

      render(<StudioHome />, { path: '/home' });
      const header = getHeaderElement();
      const link = within(header).getByRole('link', { name: 'Email staff to create course' });
      expect(link).toHaveAttribute('href', `mailto:${studioRequestEmail}`);
    });

    it('should render create new course button for users with create permission', async () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });

      render(<StudioHome />, { path: '/home' });
      const header = getHeaderElement();
      within(header).getByRole('button', { name: 'New course' }); // will error if not found
    });

    it('should show verify email layout if user inactive', async () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        userIsActive: false,
      });

      render(<StudioHome />, { path: '/home' });
      screen.getByText('Thanks for signing up, abc123!', { exact: false }); // will error if not found
    });

    it('shows the spinner before the query is complete', async () => {
      mockUseSelector.mockReturnValue({
        studioHomeLoadingStatus: RequestStatus.IN_PROGRESS,
        userIsActive: true,
      });

      render(<StudioHome />, { path: '/home' });
      const spinner = screen.getByRole('status');
      expect(spinner.textContent).toEqual('Loading...');
    });

    describe('render new library button', () => {
      it('should navigate to home_library when libraries-v2 disabled', async () => {
        mockUseSelector.mockReturnValue({
          ...studioHomeMock,
          courseCreatorStatus: COURSE_CREATOR_STATES.granted,
          librariesV2Enabled: false,
        });
        const studioBaseUrl = 'http://localhost:18010';

        render(<StudioHome />, { path: '/home' });
        await waitFor(() => {
          const createNewLibraryButton = screen.getByRole('button', { name: 'New library' });

          const mockWindowOpen = jest.spyOn(window, 'open');
          fireEvent.click(createNewLibraryButton);
          expect(mockWindowOpen).toHaveBeenCalledWith(`${studioBaseUrl}/home_library`);
          mockWindowOpen.mockRestore();
        });
      });

      it('should navigate to the library authoring page in course authoring', async () => {
        mockUseSelector.mockReturnValue({
          ...studioHomeMock,
          librariesV1Enabled: false,
        });
        render(<StudioHome />, { path: '/home' });
        const createNewLibraryButton = screen.getByRole('button', { name: 'New library' });
        fireEvent.click(createNewLibraryButton);
        expect(mockNavigate).toHaveBeenCalledWith('/library/create');
      });
    });

    it('does not render new library button for "v1 only" mode if showNewLibraryButton is False', () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        showNewLibraryButton: false,
        librariesV2Enabled: false,
      });
      render(<StudioHome />, { path: '/home' });
      expect(screen.queryByRole('button', { name: 'New library' })).not.toBeInTheDocument();
    });

    it('render new library button for "v2 only" mode even if showNewLibraryButton is False', () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        showNewLibraryButton: false,
        librariesV1Enabled: false,
      });
      render(<StudioHome />, { path: '/home' });
      expect(screen.queryByRole('button', { name: 'New library' })).toBeInTheDocument();
    });

    it('should render "create new course" container', async () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });

      const newCourseContainerText = 'Create a new course';
      render(<StudioHome />, { path: '/home' });

      expect(screen.queryByText(newCourseContainerText)).not.toBeInTheDocument();
      const createNewCourseButton = screen.getByRole('button', { name: 'New course' });
      fireEvent.click(createNewCourseButton);
      expect(screen.queryByText(newCourseContainerText)).toBeInTheDocument();
    });

    it('should hide "create new course" container', async () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });

      const newCourseContainerText = 'Create a new course';
      render(<StudioHome />, { path: '/home' });

      const createNewCourseButton = screen.getByRole('button', { name: 'New course' });
      fireEvent.click(createNewCourseButton);
      expect(screen.queryByText(newCourseContainerText)).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);
      expect(screen.queryByText(newCourseContainerText)).not.toBeInTheDocument();
    });

    describe('contact administrator card', () => {
      const adminCardTitleText = 'Are you staff on an existing Studio course?';

      it('should show the "contact administrator" card with no "add course" buttons', () => {
        mockUseSelector.mockReturnValue({
          ...studioHomeMock,
          courses: [],
          courseCreatorStatus: COURSE_CREATOR_STATES.pending,
        });
        render(<StudioHome />, { path: '/home' });
        const administratorCardTitle = screen.getByText(adminCardTitleText);
        expect(administratorCardTitle).toBeVisible();
        expect(screen.queryByText('Create your first course')).not.toBeInTheDocument();
      });

      it('should show contact administrator card with add course buttons', () => {
        mockUseSelector.mockReturnValue({
          ...studioHomeMock,
          courses: [],
          courseCreatorStatus: COURSE_CREATOR_STATES.granted,
        });
        render(<StudioHome />, { path: '/home' });
        const administratorCardTitle = screen.getByText(adminCardTitleText);
        expect(administratorCardTitle).toBeVisible();
        const addCourseButton = screen.getByTestId('contact-admin-create-course');
        expect(addCourseButton).toBeVisible();
        fireEvent.click(addCourseButton);
        expect(screen.getByTestId('create-course-form')).toBeVisible();
      });
    });

    it('should show footer', () => {
      render(<StudioHome />, { path: '/home' });
      expect(screen.getByText('Looking for help with Studio?')).toBeInTheDocument();
      expect(screen.getByText('LMS')).toHaveAttribute('href', process.env.LMS_BASE_URL);
    });
  });
});
