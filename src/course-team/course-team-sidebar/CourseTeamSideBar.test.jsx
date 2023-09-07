import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import CourseTeamSidebar from './CourseTeamSidebar';
import messages from './messages';
import initializeStore from '../../store';

const courseId = 'course-123';
let store;

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <CourseTeamSidebar courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('<CourseTeamSidebar />', () => {
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
  });

  it('render CourseTeamSidebar component correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText(messages.sidebarTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarAbout_1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarAbout_2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarAbout_3.defaultMessage)).toBeInTheDocument();
  });

  it('render CourseTeamSidebar when isOwnershipHint is true', () => {
    const { getByText } = renderComponent({ isOwnershipHint: true });

    expect(getByText(messages.ownershipTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(
      'Every course must have an Admin. If you are the Admin and you want to transfer ownership of the course, click to make another user the Admin, then ask that user to remove you from the Course Team list.',
    )).toBeInTheDocument();
  });
});
