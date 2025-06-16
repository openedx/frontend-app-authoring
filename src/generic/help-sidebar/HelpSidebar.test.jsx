// @ts-check

import { initializeMocks, render } from '../../testUtils';
import messages from './messages';
import { HelpSidebar } from '.';

const mockPathname = '/foo-bar';

const renderHelpSidebar = (props) => render(
  <HelpSidebar {...props}>
    <p>Test children</p>
  </HelpSidebar>,
  { path: mockPathname },
);

const props = {
  courseId: 'course123',
  showOtherSettings: true,
  proctoredExamSettingsUrl: '',
};

describe('HelpSidebar', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders children correctly', () => {
    const { getByText } = renderHelpSidebar(props);
    expect(getByText('Test children')).toBeTruthy();
  });

  it('should render all sidebar links with correct text', () => {
    const { getByText, queryByText } = renderHelpSidebar(props);
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
    const { queryByText } = renderHelpSidebar(initialProps);
    expect(queryByText(messages.sidebarTitleOther.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToScheduleAndDetails.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToGrading.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToCourseTeam.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToGroupConfigurations.defaultMessage)).toBeFalsy();
    expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeFalsy();
  });

  it('should render proctored mfe url only if passed not empty value', () => {
    const initialProps = { ...props, showOtherSettings: true, proctoredExamSettingsUrl: 'http:/link-to' };
    const { getByText } = renderHelpSidebar(initialProps);
    expect(getByText(messages.sidebarLinkToProctoredExamSettings.defaultMessage)).toBeTruthy();
  });
});
