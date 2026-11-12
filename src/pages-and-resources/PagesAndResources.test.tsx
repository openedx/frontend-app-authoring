import {
  screen,
  waitFor,
  initializeMocks,
  render,
  userEvent,
} from '@src/testUtils';

import { getConfig, setConfig } from '@edx/frontend-platform';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { getCourseDetailsUrl } from '@src/data/api';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useCourseUserPermissions } from '@src/authz/hooks';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { PagesAndResources, PagesAndResourcesAccess } from '.';
import { getCourseAdvancedSettingsApiUrl, getCourseAppsApiUrl } from './data/api';
import { getDiscussionsProvidersUrl, getDiscussionsSettingsUrl } from './discussions/data/api';

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
      <Routes>
        <Route element={<PagesAndResourcesAccess />}>
          <Route path="*" element={<PagesAndResources />} />
        </Route>
      </Routes>
    </CourseAuthoringProvider>,
  );

describe('PagesAndResources', () => {
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
    const initialState = {
      models: {
        courseApps: {},
      },
      pagesAndResources: {
        courseAppIds: [],
      },
    };

    initializeMocks({ initialState });
    renderComponent();

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Content permissions' })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_plugin')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_content_plugin')).not.toBeInTheDocument());
  });

  it('show content permissions section if Learning Assistant app is enabled', async () => {
    const initialState = {
      models: {
        courseApps: {
          learning_assistant: {
            id: 'learning_assistant',
            enabled: true,
            name: 'Learning Assistant',
            description: 'Learning Assistant description',
            allowedOperations: {
              configure: false,
              enable: true,
            },
            documentationLinks: {},
          },
        },
      },
      pagesAndResources: {
        courseAppIds: ['learning_assistant'],
      },
    };

    initializeMocks({ initialState });
    renderComponent();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learning Assistant')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_plugin')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_content_plugin')).toBeInTheDocument());
  });

  it('show content permissions section if Xpert learning summaries app is enabled', async () => {
    const initialState = {
      models: {
        courseApps: {
          xpert_unit_summary: {
            id: 'xpert_unit_summary',
            enabled: false,
            name: 'Xpert unit summaries',
            description: 'Use generative AI to summarize course content and reinforce learning.',
            allowedOperations: {
              enable: true,
              configure: true,
            },
            documentationLinks: {
              learnMoreConfiguration: 'https://openai.com/',
            },
          },
        },
      },
      pagesAndResources: {
        courseAppIds: ['xpert_unit_summary'],
      },
    };

    initializeMocks({ initialState });
    renderComponent();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Content permissions' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Xpert unit summaries')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_plugin')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('additional_course_content_plugin')).toBeInTheDocument());
  });

  describe('permission integration', () => {
    it('shows PermissionDeniedAlert when user has no VIEW or EDIT permissions', async () => {
      mockPermissions(false, false);

      const initialState = {
        models: {
          courseApps: {},
        },
        pagesAndResources: {
          courseAppIds: [],
        },
      };

      initializeMocks({ initialState });
      renderComponent();

      await waitFor(() => expect(screen.getByTestId('permissionDeniedAlert')).toBeInTheDocument());
    });

    it('does NOT show PermissionDeniedAlert when user has VIEW permission', async () => {
      mockPermissions(true, false);

      const initialState = {
        models: {
          courseApps: {},
        },
        pagesAndResources: {
          courseAppIds: [],
        },
      };

      initializeMocks({ initialState });
      renderComponent();

      await waitFor(() => expect(screen.queryByTestId('permissionDeniedAlert')).not.toBeInTheDocument());
    });

    it('does NOT show PermissionDeniedAlert when user has EDIT permission', async () => {
      mockPermissions(true, true);

      const initialState = {
        models: {
          courseApps: {},
        },
        pagesAndResources: {
          courseAppIds: [],
        },
      };

      initializeMocks({ initialState });
      renderComponent();

      await waitFor(() => expect(screen.queryByTestId('permissionDeniedAlert')).not.toBeInTheDocument());
    });
  });

  describe('settings routes', () => {
    const listingPath = `/course/${courseId}/pages-and-resources`;
    let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
    let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];

    const Navigation = () => {
      const { pathname } = useLocation();
      const navigate = useNavigate();
      return (
        <>
          <output aria-label="Current location">{pathname}</output>
          <button onClick={() => navigate(-1)}>Go back</button>
        </>
      );
    };

    const renderSettingsRoute = (route: string, previousPath?: string) =>
      render(
        <CourseAuthoringProvider courseId={courseId}>
          <Navigation />
          <Routes>
            <Route element={<PagesAndResourcesAccess />}>
              <Route path="/course/:courseId/pages-and-resources/*" element={<PagesAndResources />} />
            </Route>
            <Route path="*" element={<p>Previous page</p>} />
          </Routes>
        </CourseAuthoringProvider>,
        {
          routerProps: {
            initialEntries: [...(previousPath ? [previousPath] : []), `${listingPath}/${route}`],
          },
        },
      );

    const requested = (url: string) => axiosMock.history.get.some(request => request.url === url);

    beforeEach(() => {
      const mocks = initializeMocks();
      axiosMock = mocks.axiosMock;
      mockShowToast = mocks.mockShowToast;
      axiosMock.onGet(getCourseDetailsUrl(courseId, 'abc123')).reply(200, { course_id: courseId, name: 'Test course' });
      axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
        { id: 'calculator', name: 'Calculator', description: 'Course calculator', enabled: true },
        { id: 'ora_settings', name: 'ORA', description: 'Open response assessments', enabled: true },
      ]);
      axiosMock.onGet(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`).reply(200, {
        force_on_flexible_peer_openassessments: { value: false },
      });
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, {
        active: 'piazza',
        features: [],
        available: {
          piazza: {
            features: [],
            external_links: {},
            messages: [],
            has_full_support: false,
            admin_only_config: false,
          },
        },
      });
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, {
        context_key: courseId,
        enabled: true,
        provider_type: 'piazza',
        lti_configuration: {
          lti_1p1_client_key: 'client_key',
          lti_1p1_client_secret: 'client_secret',
          lti_1p1_launch_url: 'https://example.com/discussions',
        },
        plugin_configuration: {},
      });
    });

    it.each([
      'calculator/settings',
      'ora_settings/settings',
      'discussion',
      'discussion/settings',
      'discussion/configure/piazza',
    ])('redirects view-only users from %s without mounting settings', async route => {
      mockPermissions(true, false);
      renderSettingsRoute(route);

      await waitFor(() => expect(screen.getByLabelText('Current location').textContent).toBe(listingPath));
      expect(await screen.findByRole('heading', { name: 'Pages & Resources' })).toBeVisible();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(requested(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`)).toBe(false);
      expect(requested(getDiscussionsProvidersUrl(courseId))).toBe(false);
      expect(requested(getDiscussionsSettingsUrl(courseId))).toBe(false);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('replaces the blocked settings history entry', async () => {
      mockPermissions(true, false);
      const user = userEvent.setup();
      renderSettingsRoute('ora_settings/settings', '/previous');

      await waitFor(() => expect(screen.getByLabelText('Current location').textContent).toBe(listingPath));
      await user.click(screen.getByRole('button', { name: 'Go back' }));
      expect(await screen.findByText('Previous page')).toBeVisible();
    });

    it.each([
      ['calculator/settings', 'Configure calculator'],
      ['ora_settings/settings', 'Configure Flexible Peer Grading'],
      ['discussion', 'Configure discussions'],
      ['discussion/settings', 'Configure discussions'],
      ['discussion/configure/piazza', 'Configure discussions'],
    ])('lets managers open %s', async (route, title) => {
      mockPermissions(true, true);
      renderSettingsRoute(route);

      expect(await screen.findByRole('dialog', { name: title })).toBeVisible();
      expect(screen.getByLabelText('Current location').textContent).toBe(`${listingPath}/${route}`);
    });

    it('keeps settings available with AuthZ disabled', async () => {
      renderSettingsRoute('calculator/settings');

      expect(await screen.findByRole('dialog', { name: 'Configure calculator' })).toBeVisible();
    });
  });
});
