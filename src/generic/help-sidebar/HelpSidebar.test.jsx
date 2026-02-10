// @ts-check

import { waitFor } from '@testing-library/react';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { initializeMocks, render } from '../../testUtils';
import messages from './messages';
import { HelpSidebar } from '.';

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

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
    // @ts-ignore
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: undefined,
    });
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

  it('should render the advanced settings sidebar link when authz.enable_course_authoring flag is enabled and the user is authorized', async () => {
    // Mock feature flag
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
    // @ts-ignore
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: true },
    });
    const { queryByText } = renderHelpSidebar(props);
    await waitFor(() => expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeTruthy());
  });
  it('should not render the advanced settings sidebar link when authz.enable_course_authoring flag is enabled and the user is not authorized', async () => {
    // Mock feature flag
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
    // @ts-ignore
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { canManageAdvancedSettings: false },
    });
    const { queryByText } = renderHelpSidebar(props);
    await waitFor(() => expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeFalsy());
  });
  it('should not render the advanced settings sidebar link when authz.enable_course_authoring flag is enabled and the permissions are still loading', async () => {
    // Mock feature flag
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    // Mock the useUserPermissions hook to return true for the authz.enable_course_authoring permission
    // @ts-ignore
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: true,
      data: undefined,
    });
    const { queryByText } = renderHelpSidebar(props);
    await waitFor(() => expect(queryByText(messages.sidebarLinkToAdvancedSettings.defaultMessage)).toBeFalsy());
  });
});
