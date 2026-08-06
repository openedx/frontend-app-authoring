import userEvent from '@testing-library/user-event';
import { getConfig, setConfig } from '@edx/frontend-platform';
import {
  screen,
  initializeMocks,
  render as baseRender,
  waitFor,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { USER_ROLES } from '@src/constants';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';

import { courseTeamMock, courseTeamWithOneUser, courseTeamWithoutUsers } from './__mocks__';
import { getCourseTeamApiUrl, updateCourseTeamUserApiUrl } from './data/api';
import CourseTeam from './CourseTeam';
import messages from './messages';
import addUserFormMessages from './add-user-form/messages';

let axiosMock;
let validateUserPermissionsMock;
const mockPathname = '/foo-bar';
const courseId = '123';
const adminConsoleUrl = 'https://admin-console.example.com';

const render = () =>
  baseRender(
    <CourseAuthoringProvider courseId={courseId}>
      <CourseTeam />
    </CourseAuthoringProvider>,
    { path: mockPathname },
  );

describe('<CourseTeam />', () => {
  const originalLocation = window.location;
  const mockLocationReplace = jest.fn();

  beforeAll(() => {
    // jsdom's window.location is read-only, so swap it for one whose replace() we can assert on.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: Object.assign(Object.create(Object.getPrototypeOf(originalLocation)), originalLocation, {
        replace: mockLocationReplace,
      }),
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    mockWaffleFlags();
  });

  it('render CourseTeam component with 3 team members correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    render();

    expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByTestId('course-team-sidebar')).toBeInTheDocument();
    expect(screen.queryAllByTestId('course-team-member')).toHaveLength(3);
  });

  it('render CourseTeam component with 1 team member correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    render();

    expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByTestId('course-team-sidebar')).toBeInTheDocument();
    expect(screen.getAllByTestId('course-team-member')).toHaveLength(1);
  });

  it('render CourseTeam component without team member correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithoutUsers);

    render();

    expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByTestId('course-team-sidebar__initial')).toBeInTheDocument();
    expect(screen.queryAllByTestId('course-team-member')).toHaveLength(0);
  });

  it('render CourseTeam component with initial sidebar correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithoutUsers);

    render();

    expect(await screen.findByTestId('course-team-sidebar__initial')).toBeInTheDocument();
    expect(screen.queryByTestId('course-team-sidebar')).not.toBeInTheDocument();
  });

  it('render CourseTeam component without initial sidebar correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    render();

    expect(await screen.findByTestId('course-team-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('course-team-sidebar__initial')).not.toBeInTheDocument();
  });

  it('displays AddUserForm when clicking the "Add New Member" button', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    render();

    expect(screen.queryByTestId('add-user-form')).not.toBeInTheDocument();

    const addButton = await screen.findByRole('button', { name: messages.addNewMemberButton.defaultMessage });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);
    expect(screen.queryByTestId('add-user-form')).toBeInTheDocument();
  });

  it('displays AddUserForm when clicking the "Add a New Team member" button', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    render();

    expect(screen.queryByTestId('add-user-form')).not.toBeInTheDocument();

    const addButton = await screen.findByRole('button', { name: 'Add a new team member' });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);
    expect(screen.queryByTestId('add-user-form')).toBeInTheDocument();
  });

  it('not displays "Add New Member" and AddTeamMember component when isAllowActions is false', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, {
        ...courseTeamWithOneUser,
        allowActions: false,
      });

    render();

    await screen.findByText(messages.headingTitle.defaultMessage);
    expect(screen.queryByRole('button', { name: messages.addNewMemberButton.defaultMessage })).not.toBeInTheDocument();
    expect(screen.queryByTestId('add-team-member')).not.toBeInTheDocument();
  });

  it('should delete user', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);
    const deleteUrl = updateCourseTeamUserApiUrl(courseId, 'staff@example.com');

    axiosMock
      .onDelete(deleteUrl)
      .reply(200);

    render();

    const deleteButton = (await screen.findAllByRole('button', { name: /delete user/i }))[0];
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);

    expect(await screen.findByText('Delete course team member'));
    const confirmDelete = screen.getByRole('button', { name: /delete/i });
    expect(confirmDelete).toBeInTheDocument();
    await user.click(confirmDelete);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toEqual(deleteUrl);
  });

  it('should change role user', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    const updateUrl = updateCourseTeamUserApiUrl(courseId, 'staff@example.com');

    axiosMock
      .onPut(updateUrl)
      .reply(200, { role: USER_ROLES.admin });

    render();

    const updateButton = (await screen.findAllByRole('button', { name: /add admin access/i }))[0];
    expect(updateButton).toBeInTheDocument();
    await user.click(updateButton);

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });
    expect(axiosMock.history.put[0].url).toEqual(updateUrl);
  });

  it('should show warning modal when submitting an already existing user email', async () => {
    const user = userEvent.setup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    render();

    await user.click(await screen.findByRole('button', { name: messages.addNewMemberButton.defaultMessage }));
    await user.type(screen.getByRole('textbox'), 'staff@example.com');
    await user.click(screen.getByRole('button', { name: addUserFormMessages.addUserButton.defaultMessage }));

    expect(await screen.findByText('Already a course team member')).toBeInTheDocument();
  });

  it('should hide the form after successfully adding a new user', async () => {
    const user = userEvent.setup();
    const newEmail = 'newuser@example.com';
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);
    axiosMock
      .onPost(updateCourseTeamUserApiUrl(courseId, newEmail))
      .reply(200);

    render();

    await user.click(await screen.findByRole('button', { name: messages.addNewMemberButton.defaultMessage }));
    await user.type(screen.getByRole('textbox'), newEmail);
    await user.click(screen.getByRole('button', { name: addUserFormMessages.addUserButton.defaultMessage }));

    await waitFor(() => {
      expect(screen.queryByTestId('add-user-form')).not.toBeInTheDocument();
    });
  });

  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(403);

    render();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  describe('when authz is enabled for the course', () => {
    beforeEach(() => {
      setConfig({ ...getConfig(), ADMIN_CONSOLE_URL: adminConsoleUrl });
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      axiosMock
        .onGet(getCourseTeamApiUrl(courseId))
        .reply(200, courseTeamMock);
    });

    it('redirects to the admin console instead of rendering the course team page', async () => {
      validateUserPermissionsMock.mockResolvedValue({ canViewCourseTeam: true });

      render();

      await waitFor(() => {
        expect(window.location.replace).toHaveBeenCalledWith(
          `${adminConsoleUrl}/authz?scope=${encodeURIComponent(courseId)}`,
        );
      });
      expect(screen.queryByText(messages.headingTitle.defaultMessage)).not.toBeInTheDocument();
    });

    it('denies access without redirecting when the user cannot view the course team', async () => {
      // The CMS denies the legacy API too, so the permission check must win over the 403 alert.
      axiosMock
        .onGet(getCourseTeamApiUrl(courseId))
        .reply(403);
      validateUserPermissionsMock.mockResolvedValue({ canViewCourseTeam: false });

      render();

      expect(await screen.findByTestId('permissionDeniedAlert')).toBeInTheDocument();
      expect(window.location.replace).not.toHaveBeenCalled();
    });
  });

  it('renders the course team page when authz is disabled', async () => {
    setConfig({ ...getConfig(), ADMIN_CONSOLE_URL: adminConsoleUrl });
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    render();

    expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
