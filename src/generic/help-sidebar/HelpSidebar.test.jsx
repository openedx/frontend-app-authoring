import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import HelpSidebar from '.';
import messages from './messages';

const mockPathname = '/foo-bar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <IntlProvider locale="en">
    <HelpSidebar
      courseId="course123"
      showOtherSettings
      proctoredExamSettingsUrl=""
    >
      <p>Test children</p>
    </HelpSidebar>
  </IntlProvider>
);

describe('HelpSidebar', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Test children')).toBeTruthy();
  });
  it('should render all sidebar links with correct text', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.sidebarTitleOther.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToScheduleAndDetails.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToGrading.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToCourseTeam.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToGroupConfigurations.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToProctoredExamSettings.defaultMessage)).toBeTruthy();
  });
});
