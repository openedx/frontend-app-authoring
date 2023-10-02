import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import initializeStore from '../../store';
import messages from './messages';
import { HelpSidebar } from '.';

const mockPathname = '/foo-bar';

let store;
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = (props) => (
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <HelpSidebar
        {...props}
      >
        <p>Test children</p>
      </HelpSidebar>
    </IntlProvider>
  </AppProvider>
);

const props = {
  courseId: 'course123',
  showOtherSettings: true,
  proctoredExamSettingsUrl: '',
};

describe('HelpSidebar', () => {
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

  it('renders children correctly', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText('Test children')).toBeTruthy();
  });

  it('should render all sidebar links with correct text', () => {
    const { getByText, queryByText } = render(<RootWrapper {...props} />);
    expect(getByText(messages.sidebarTitleOther.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToScheduleAndDetails.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToGrading.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToCourseTeam.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToGroupConfigurations.defaultMessage)).toBeTruthy();
    expect(getByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeTruthy();
    expect(queryByText(messages.sidebarLinkToProctoredExamSettings.defaultMessage)).toBeFalsy();
  });

  it('should hide other settings url if showOtherSettings disabled', () => {
    const initialProps = { ...props, showOtherSettings: false };
    const { queryByText } = render(<RootWrapper {...initialProps} />);
    expect(queryByText(messages.sidebarTitleOther.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToScheduleAndDetails.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToGrading.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToCourseTeam.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToGroupConfigurations.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeFalsy();
  });

  it('should render proctored mfe url only if passed not empty value', () => {
    const initialProps = { ...props, showOtherSettings: true, proctoredExamSettingsUrl: 'http:/link-to' };
    const { getByText } = render(<RootWrapper {...initialProps} />);
    expect(getByText(messages.sidebarLinkToProctoredExamSettings.defaultMessage)).toBeTruthy();
  });
});
