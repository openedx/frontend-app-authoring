import * as reactRedux from 'react-redux';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useUserPermissions } from '@src/authz/data/apiHooks';

import {
  fireEvent,
  render,
  screen,
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
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
}));

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

/** Set the result of the scope-less "can view any team" permission check. */
const mockViewTeamPermissions = (data: Record<string, boolean>) => {
  jest.mocked(useUserPermissions).mockReturnValue({
    isLoading: false,
    data,
  } as unknown as ReturnType<typeof useUserPermissions>);
};

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
      mockViewTeamPermissions({});
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
      mockViewTeamPermissions({});
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

    it.each([
      ['course', { canViewCourseTeam: true, canViewLibraryTeam: false }],
      ['library', { canViewCourseTeam: false, canViewLibraryTeam: true }],
    ])('should render roles and permissions button when authz is enabled and the user can view a %s team', async (
      _team,
      permissions,
    ) => {
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'https://admin-console.example.com',
      });
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      mockViewTeamPermissions(permissions);

      render(<StudioHome />, { path: '/home' });
      const header = getHeaderElement();
      const rolesButton = within(header).getByRole('link', { name: 'Roles and permissions' });
      expect(rolesButton).toHaveAttribute('href', 'https://admin-console.example.com/authz');
    });

    it('should not render roles and permissions button when authz is enabled but the user cannot manage any team', async () => {
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'https://admin-console.example.com',
      });
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      mockViewTeamPermissions({ canViewCourseTeam: false, canViewLibraryTeam: false });

      render(<StudioHome />, { path: '/home' });
      const header = getHeaderElement();
      expect(within(header).queryByRole('link', { name: 'Roles and permissions' })).not.toBeInTheDocument();
    });

    it('should not render roles and permissions button when authz is disabled', async () => {
      setConfig({
        ...getConfig(),
        ADMIN_CONSOLE_URL: 'https://admin-console.example.com',
      });
      mockWaffleFlags({ enableAuthzCourseAuthoring: false });
      mockViewTeamPermissions({ canViewCourseTeam: true, canViewLibraryTeam: true });

      render(<StudioHome />, { path: '/home' });
      const header = getHeaderElement();
      expect(within(header).queryByRole('link', { name: 'Roles and permissions' })).not.toBeInTheDocument();
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
      it('should not render new library button when libraries-v2 disabled', () => {
        mockUseSelector.mockReturnValue({
          ...studioHomeMock,
          courseCreatorStatus: COURSE_CREATOR_STATES.granted,
          librariesV2Enabled: false,
        });

        render(<StudioHome />, { path: '/home' });
        expect(screen.queryByRole('button', { name: 'New library' })).not.toBeInTheDocument();
      });

      it('should render a link to the library authoring page when libraries-v2 enabled', () => {
        mockUseSelector.mockReturnValue({
          ...studioHomeMock,
        });
        render(<StudioHome />, { path: '/home' });
        const createNewLibraryButton = screen.getByRole('link', { name: 'New library' });
        expect(createNewLibraryButton).toHaveAttribute('href', '/library/create');
      });
    });

    it('does not render new library button when showNewLibraryV2Button is False', () => {
      mockUseSelector.mockReturnValue({
        ...studioHomeMock,
        showNewLibraryV2Button: false,
      });
      render(<StudioHome />, { path: '/home' });
      expect(screen.queryByRole('button', { name: 'New library' })).not.toBeInTheDocument();
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
