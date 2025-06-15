// @ts-check
import { courseTeamMock, courseTeamWithOneUser, courseTeamWithoutUsers } from './__mocks__';
import { getCourseTeamApiUrl, updateCourseTeamUserApiUrl } from './data/api';
import CourseTeam from './CourseTeam';
import messages from './messages';
import { USER_ROLES } from '../constants';
import { executeThunk } from '../utils';
import { RequestStatus } from '../data/constants';
import { changeRoleTeamUserQuery, deleteCourseTeamQuery } from './data/thunk';
import {
  fireEvent,
  initializeMocks,
  render as baseRender,
  waitFor,
} from '../testUtils';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

const render = () => baseRender(<CourseTeam courseId={courseId} />, { path: mockPathname });

describe('<CourseTeam />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
  });

  it('render CourseTeam component with 3 team members correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    const {
      getByText, getByRole, getByTestId, queryAllByTestId,
    } = render();

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
      expect(getByTestId('course-team-sidebar')).toBeInTheDocument();
      expect(queryAllByTestId('course-team-member')).toHaveLength(3);
    });
  });

  it('render CourseTeam component with 1 team member correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    const {
      getByText, getByRole, getByTestId, getAllByTestId,
    } = render();

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
      expect(getByTestId('course-team-sidebar')).toBeInTheDocument();
      expect(getAllByTestId('course-team-member')).toHaveLength(1);
    });
  });

  it('render CourseTeam component without team member correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithoutUsers);

    const {
      getByText, getByRole, getByTestId, queryAllByTestId,
    } = render();

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
      expect(getByTestId('course-team-sidebar__initial')).toBeInTheDocument();
      expect(queryAllByTestId('course-team-member')).toHaveLength(0);
    });
  });

  it('render CourseTeam component with initial sidebar correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithoutUsers);

    const { getByTestId, queryByTestId } = render();

    await waitFor(() => {
      expect(getByTestId('course-team-sidebar__initial')).toBeInTheDocument();
      expect(queryByTestId('course-team-sidebar')).not.toBeInTheDocument();
    });
  });

  it('render CourseTeam component without initial sidebar correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    const { getByTestId, queryByTestId } = render();

    await waitFor(() => {
      expect(queryByTestId('course-team-sidebar__initial')).not.toBeInTheDocument();
      expect(getByTestId('course-team-sidebar')).toBeInTheDocument();
    });
  });

  it('displays AddUserForm when clicking the "Add New Member" button', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    const { getByRole, queryByTestId } = render();

    await waitFor(() => {
      expect(queryByTestId('add-user-form')).not.toBeInTheDocument();
      const addButton = getByRole('button', { name: messages.addNewMemberButton.defaultMessage });
      fireEvent.click(addButton);
      expect(queryByTestId('add-user-form')).toBeInTheDocument();
    });
  });

  it('displays AddUserForm when clicking the "Add a New Team member" button', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    const { getByRole, queryByTestId } = render();

    await waitFor(() => {
      expect(queryByTestId('add-user-form')).not.toBeInTheDocument();
      const addButton = getByRole('button', { name: 'Add a new team member' });
      fireEvent.click(addButton);
      expect(queryByTestId('add-user-form')).toBeInTheDocument();
    });
  });

  it('not displays "Add New Member" and AddTeamMember component when isAllowActions is false', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, {
        ...courseTeamWithOneUser,
        allowActions: false,
      });

    const { queryByRole, queryByTestId } = render();

    await waitFor(() => {
      expect(queryByRole('button', { name: messages.addNewMemberButton.defaultMessage })).not.toBeInTheDocument();
      expect(queryByTestId('add-team-member')).not.toBeInTheDocument();
    });
  });

  it('should delete user', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    const { queryByText } = render();

    axiosMock
      .onDelete(updateCourseTeamUserApiUrl(courseId, 'staff@example.com'))
      .reply(200);

    await executeThunk(deleteCourseTeamQuery(courseId, 'staff@example.com'), store.dispatch);
    expect(queryByText('staff@example.com')).not.toBeInTheDocument();
  });

  it('should change role user', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    const { getAllByText } = render();

    axiosMock
      .onPut(updateCourseTeamUserApiUrl(courseId, 'staff@example.com'))
      .reply(200, { role: USER_ROLES.admin });

    await executeThunk(changeRoleTeamUserQuery(courseId, 'staff@example.com', { role: USER_ROLES.admin }), store.dispatch);
    expect(getAllByText('Admin')).toHaveLength(1);
  });

  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(403);

    const { getByRole } = render();

    await waitFor(() => {
      expect(getByRole('alert')).toBeInTheDocument();
      const { loadingCourseTeamStatus } = store.getState().courseTeam;
      expect(loadingCourseTeamStatus).toEqual(RequestStatus.DENIED);
    });
  });

  it('sets loading status to FAILED upon receiving a 404 response from the API', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(404);

    render();

    await waitFor(() => {
      const { loadingCourseTeamStatus } = store.getState().courseTeam;
      expect(loadingCourseTeamStatus).toEqual(RequestStatus.FAILED);
    });
  });
});
