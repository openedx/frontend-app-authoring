import React from 'react';
import {
  render,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../store';
import { courseTeamMock, courseTeamWithOneUser } from './__mocks__';
import { getCourseTeamApiUrl } from './data/api';
import CourseTeam from './CourseTeam';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseTeam courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseTeam />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('render CourseTeam component with 3 team members correctly', async () => {
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamMock);

    const {
      getByText, getByRole, getByTestId, queryAllByTestId,
    } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
      expect(getByTestId('course-team-sidebar')).toBeInTheDocument();
      expect(queryAllByTestId('course-team-member')).toHaveLength(3);
    });
  });

  it('render CourseTeam component with 1 team member correctly', async () => {
    cleanup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    const {
      getByText, getByRole, getByTestId, getAllByTestId,
    } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.addNewMemberButton.defaultMessage })).toBeInTheDocument();
      expect(getByTestId('course-team-sidebar')).toBeInTheDocument();
      expect(getAllByTestId('course-team-member')).toHaveLength(1);
    });
  });

  it('displays AddUserForm when clicking the "Add New Member" button', async () => {
    cleanup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    const { getByRole, queryByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      expect(queryByTestId('add-user-form')).not.toBeInTheDocument();
      const addButton = getByRole('button', { name: messages.addNewMemberButton.defaultMessage });
      fireEvent.click(addButton);
      expect(queryByTestId('add-user-form')).toBeInTheDocument();
    });
  });

  it('displays AddUserForm when clicking the "Add a New Team member" button', async () => {
    cleanup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, courseTeamWithOneUser);

    const { getByRole, queryByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      expect(queryByTestId('add-user-form')).not.toBeInTheDocument();
      const addButton = getByRole('button', { name: 'Add a new team member' });
      fireEvent.click(addButton);
      expect(queryByTestId('add-user-form')).toBeInTheDocument();
    });
  });

  it('not displays "Add New Member" and AddTeamMember component when isAllowActions is false', async () => {
    cleanup();
    axiosMock
      .onGet(getCourseTeamApiUrl(courseId))
      .reply(200, {
        ...courseTeamWithOneUser,
        allowActions: false,
      });

    const { queryByRole, queryByTestId } = render(<RootWrapper />);

    await waitFor(() => {
      expect(queryByRole('button', { name: messages.addNewMemberButton.defaultMessage })).not.toBeInTheDocument();
      expect(queryByTestId('add-team-member')).not.toBeInTheDocument();
    });
  });
});
