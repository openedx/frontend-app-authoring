import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import SettingsSidebar from './SettingsSidebar';
import messages from './messages';

const courseId = 'course-123';
let store;

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <SettingsSidebar intl={{ formatMessage: jest.fn() }} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<SettingsSidebar />', () => {
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
  it('renders about and other sidebar titles correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.about.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.other.defaultMessage)).toBeInTheDocument();
  });
  it('renders about descriptions correctly', () => {
    const { getByText } = render(<RootWrapper />);
    const aboutThirtyDescription = getByText('When you enter strings as policy values, ensure that you use double quotation marks (“) around the string. Do not use single quotation marks (‘).');
    expect(getByText(messages.aboutDescription1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.aboutDescription2.defaultMessage)).toBeInTheDocument();
    expect(aboutThirtyDescription).toBeInTheDocument();
  });
  it('renders links with correct title and destinations', () => {
    const { getByText } = render(<RootWrapper />);
    const BASE_URL = 'http://localhost:2001';
    const scheduleDetailsLink = getByText(messages.otherCourseSettingsLinkToScheduleAndDetails.defaultMessage);
    expect(scheduleDetailsLink).toBeInTheDocument();
    expect(scheduleDetailsLink.getAttribute('href')).toBe(`${BASE_URL}/course/course-123/settings/details`);
    const gradingLink = getByText(messages.otherCourseSettingsLinkToGrading.defaultMessage);
    expect(gradingLink).toBeInTheDocument();
    expect(gradingLink.getAttribute('href')).toBe(`${BASE_URL}/course/course-123/settings/grading`);
    const courseTeamLink = getByText(messages.otherCourseSettingsLinkToCourseTeam.defaultMessage);
    expect(courseTeamLink).toBeInTheDocument();
    expect(courseTeamLink.getAttribute('href')).toBe(`${BASE_URL}/course/course-123/course_team`);
    const groupConfigurationsLink = getByText(messages.otherCourseSettingsLinkToGroupConfigurations.defaultMessage);
    expect(groupConfigurationsLink).toBeInTheDocument();
    expect(groupConfigurationsLink.getAttribute('href')).toBe('http://localhost:18010/group_configurations/course-123');
    const proctoredExamSettingsLink = getByText(messages.otherCourseSettingsLinkToProctoredExamSettings.defaultMessage);
    expect(proctoredExamSettingsLink).toBeInTheDocument();
    expect(proctoredExamSettingsLink.getAttribute('href')).toBe(`${BASE_URL}/course/course-123/proctored-exam-settings`);
  });
});
