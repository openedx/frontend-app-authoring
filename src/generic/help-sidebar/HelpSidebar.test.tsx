import { waitFor } from '@testing-library/react';

import { useCourseUserPermissions } from '@src/authz/hooks';
import { initializeMocks, render } from '@src/testUtils';

import messages from './messages';
import { HelpSidebar } from '.';

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn(),
}));

const mockPathname = '/foo-bar';

const renderHelpSidebar = (props) =>
  render(
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

/**
 * Set the result of the course-scoped Advanced Settings permission check.
 * HelpSidebar only reads `canManageAdvancedSettings`; the loading / authz-disabled
 * fallbacks are owned (and tested) by useCourseUserPermissions itself.
 */
const mockAdvancedSettingsPermission = (canManageAdvancedSettings: boolean, isLoading = false) => {
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading,
    isAuthzEnabled: true,
    canManageAdvancedSettings,
  } as unknown as ReturnType<typeof useCourseUserPermissions>);
};

describe('HelpSidebar', () => {
  beforeEach(() => {
    initializeMocks();
    mockAdvancedSettingsPermission(true);
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

  it('should render the advanced settings sidebar link when the user can manage advanced settings', async () => {
    mockAdvancedSettingsPermission(true);
    const { queryByText } = renderHelpSidebar(props);
    await waitFor(() => expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeTruthy());
  });

  it('should not render the advanced settings sidebar link when the user cannot manage advanced settings', async () => {
    mockAdvancedSettingsPermission(false);
    const { queryByText } = renderHelpSidebar(props);
    await waitFor(() => expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeFalsy());
  });

  it('should not render the advanced settings sidebar link while the permission check is loading', async () => {
    mockAdvancedSettingsPermission(false, true);
    const { queryByText } = renderHelpSidebar(props);
    await waitFor(() => expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeFalsy());
  });
});
