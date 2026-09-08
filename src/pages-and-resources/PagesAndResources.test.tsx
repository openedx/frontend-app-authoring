import {
  screen,
  waitFor,
  initializeMocks,
  render,
} from '@src/testUtils';

import { getConfig, setConfig } from '@edx/frontend-platform';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { getCourseAppsApiUrl } from '@src/data/api';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { PagesAndResources } from '.';

// Mock authz hooks
jest.mock('@src/authz/hooks', () => ({
  ...jest.requireActual('@src/authz/hooks'),
  useCourseUserPermissions: jest.fn(),
}));

const mockPlugin = (identifier) => ({
  plugins: [
    {
      op: PLUGIN_OPERATIONS.Insert,
      widget: {
        id: 'mock-plugin-1',
        type: DIRECT_PLUGIN,
        priority: 1,
        RenderWidget: () => <div data-testid={identifier}>HELLO</div>,
      },
    },
  ],
});

const courseId = 'course-v1:edX+TestX+Test_Course';

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <PagesAndResources />
    </CourseAuthoringProvider>,
  );

describe('PagesAndResources', () => {
  let axiosMock;

  beforeEach(() => {
    jest.clearAllMocks();
    setConfig({
      ...getConfig(),
      pluginSlots: {
        'org.openedx.frontend.authoring.additional_course_plugin.v1': mockPlugin('additional_course_plugin'),
        'org.openedx.frontend.authoring.additional_course_content_plugin.v1': mockPlugin(
          'additional_course_content_plugin',
        ),
      },
    });

    // Set up waffle flags to disable authz by default
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });

    // Default: authz disabled allows everything
    jest.mocked(useCourseUserPermissions).mockReturnValue({
      isLoading: false,
      isAuthzEnabled: false,
      canViewPagesAndResources: true,
      canManagePagesAndResources: true,
    } as ReturnType<typeof useCourseUserPermissions>);

    ({ axiosMock } = initializeMocks());
    // Default: no course apps installed. Override per-test with axiosMock as needed.
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, []);
  });

  // Helper to set up permission mocks
  const mockPermissions = (canView: boolean, canManage: boolean) => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useCourseUserPermissions).mockReturnValue({
      isLoading: false,
      isAuthzEnabled: true,
      canViewPagesAndResources: canView,
      canManagePagesAndResources: canManage,
    } as ReturnType<typeof useCourseUserPermissions>);
  };

  it('doesn\'t show content permissions section if relevant apps are not enabled', async () => {
    renderComponent();

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Content permissions' })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_plugin')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_content_plugin')).not.toBeInTheDocument());
  });

  it('show content permissions section if Learning Assistant app is enabled', async () => {
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
      {
        id: 'learning_assistant',
        enabled: true,
        name: 'Learning Assistant',
        description: 'Learning Assistant description',
        allowed_operations: {
          configure: false,
          enable: true,
        },
        documentation_links: {},
      },
    ]);

    renderComponent();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learning Assistant')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_plugin')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_content_plugin')).toBeInTheDocument());
  });

  it('show content permissions section if Xpert learning summaries app is enabled', async () => {
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
      {
        id: 'xpert_unit_summary',
        enabled: false,
        name: 'Xpert unit summaries',
        description: 'Use generative AI to summarize course content and reinforce learning.',
        allowed_operations: {
          enable: true,
          configure: true,
        },
        documentation_links: {
          learn_more_configuration: 'https://openai.com/',
        },
      },
    ]);

    renderComponent();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Xpert unit summaries')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_plugin')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_content_plugin')).toBeInTheDocument());
  });

  describe('permission integration', () => {
    it('shows PermissionDeniedAlert when user has no VIEW or EDIT permissions', async () => {
      mockPermissions(false, false);

      renderComponent();

      await waitFor(() => expect(screen.getByTestId('permissionDeniedAlert')).toBeInTheDocument());
    });

    it('does NOT show PermissionDeniedAlert when user has VIEW permission', async () => {
      mockPermissions(true, false);

      renderComponent();

      await waitFor(() => expect(screen.queryByTestId('permissionDeniedAlert')).not.toBeInTheDocument());
    });

    it('does NOT show PermissionDeniedAlert when user has EDIT permission', async () => {
      mockPermissions(true, true);

      renderComponent();

      await waitFor(() => expect(screen.queryByTestId('permissionDeniedAlert')).not.toBeInTheDocument());
    });
  });
});
