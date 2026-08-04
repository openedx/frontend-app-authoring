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
 * Set the result of the course-scoped permission checks used by the "Other course settings" links.
 * The loading / authz-disabled fallbacks are owned (and tested) by useCourseUserPermissions itself,
 * so tests state the resolved answers directly.
 */
const mockCoursePermissions = (
  permissions: Record<string, boolean> = {},
  { isLoading = false, isAuthzEnabled = true } = {},
) => {
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading,
    isAuthzEnabled,
    canViewScheduleAndDetails: true,
    canViewGradingSettings: true,
    canViewCourseTeam: true,
    canManageGroupConfigurations: true,
    canManageAdvancedSettings: true,
    ...permissions,
  } as unknown as ReturnType<typeof useCourseUserPermissions>);
};

describe('HelpSidebar', () => {
  beforeEach(() => {
    initializeMocks();
    mockCoursePermissions({}, { isAuthzEnabled: false });
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

  describe('authz validation', () => {
    it.each([
      ['canViewScheduleAndDetails', messages.sidebarLinkToScheduleAndDetails],
      ['canViewGradingSettings', messages.sidebarLinkToGrading],
      ['canManageGroupConfigurations', messages.sidebarLinkToGroupConfigurations],
      ['canManageAdvancedSettings', messages.sidebarLinkToAdvancedSettings],
    ])('renders the %s link only when the permission is granted', async (permission, message) => {
      mockCoursePermissions({ [permission]: true });
      const { queryByText, unmount } = renderHelpSidebar(props);
      await waitFor(() => expect(queryByText(message.defaultMessage)).toBeTruthy());
      unmount();

      mockCoursePermissions({ [permission]: false });
      const { queryByText: queryWithoutPermission } = renderHelpSidebar(props);
      await waitFor(() => expect(queryWithoutPermission(message.defaultMessage)).toBeFalsy());
    });

    it('should render the roles and permissions link instead of course team when authz is enabled', async () => {
      mockCoursePermissions({ canViewCourseTeam: true });
      const { queryByText } = renderHelpSidebar(props);
      await waitFor(() => expect(queryByText(messages.sidebarLinkToRolesAndPermissions.defaultMessage)).toBeTruthy());
      expect(queryByText(messages.sidebarLinkToCourseTeam.defaultMessage)).toBeFalsy();
    });

    it('should render the course team link when authz is disabled', async () => {
      mockCoursePermissions({}, { isAuthzEnabled: false });
      const { queryByText } = renderHelpSidebar(props);
      await waitFor(() => expect(queryByText(messages.sidebarLinkToCourseTeam.defaultMessage)).toBeTruthy());
      expect(queryByText(messages.sidebarLinkToRolesAndPermissions.defaultMessage)).toBeFalsy();
    });

    it('should not render the team link when the user cannot view the course team', async () => {
      mockCoursePermissions({ canViewCourseTeam: false });
      const { queryByText } = renderHelpSidebar(props);
      await waitFor(() => expect(queryByText(messages.sidebarLinkToRolesAndPermissions.defaultMessage)).toBeFalsy());
      expect(queryByText(messages.sidebarLinkToCourseTeam.defaultMessage)).toBeFalsy();
    });

    it('should not render any of the gated links while the permission check is loading', async () => {
      mockCoursePermissions({
        canViewScheduleAndDetails: false,
        canViewGradingSettings: false,
        canViewCourseTeam: false,
        canManageGroupConfigurations: false,
        canManageAdvancedSettings: false,
      }, { isLoading: true });
      const { queryByText } = renderHelpSidebar(props);

      await waitFor(() => {
        expect(queryByText(messages.sidebarLinkToScheduleAndDetails.defaultMessage)).toBeFalsy();
      });
      expect(queryByText(messages.sidebarLinkToGrading.defaultMessage)).toBeFalsy();
      expect(queryByText(messages.sidebarLinkToRolesAndPermissions.defaultMessage)).toBeFalsy();
      expect(queryByText(messages.sidebarLinkToGroupConfigurations.defaultMessage)).toBeFalsy();
      expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeFalsy();
    });
  });
});
