import { getConfig } from '@edx/frontend-platform';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthzApiUrl } from '@src/authz/data/api';
import { PermissionValidationRequestItem } from '@src/authz/types';
import CourseAuthoringRoutes from '@src/CourseAuthoringRoutes';
import { getApiWaffleFlagsUrl, getCourseDetailsUrl } from '@src/data/api';
import {
  act,
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';

const courseId = 'course-v1:edX+TestX+Test_Course';
const coursePath = `/course/${courseId}`;
// Backend contracts are local fixtures so this cross-feature suite does not import feature internals.
const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTabHandlerUrl = (id: string) => `${getApiBaseUrl()}/api/contentstore/v0/tabs/${id}`;
const getCourseAppsApiUrl = () => `${getApiBaseUrl()}/api/course_apps/v1/apps`;
const getCourseAdvancedSettingsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v0/advanced_settings`;
const getDiscussionsProvidersUrl = (id: string) => `${getApiBaseUrl()}/api/discussions/v0/course/${id}/providers`;
const getDiscussionsSettingsUrl = (id: string) => `${getApiBaseUrl()}/api/discussions/v0/course/${id}/settings`;
const getStudioHomeApiUrl = () => new URL('api/contentstore/v1/home', getApiBaseUrl()).href;
const getCourseUpdatesApiUrl = (id: string) => `${getApiBaseUrl()}/course_info_update/${id}/`;
const getCourseHandoutApiUrl = (id: string) =>
  `${getApiBaseUrl()}/xblock/block-v1:${id.substring(10)}+type@course_info+block@handouts`;
const discussionProviders = {
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
};
const discussionSettings = {
  context_key: courseId,
  enabled: true,
  provider_type: 'piazza',
  lti_configuration: {
    lti_1p1_client_key: 'client_key',
    lti_1p1_client_secret: 'client_secret',
    lti_1p1_launch_url: 'https://example.com/discussions',
  },
  plugin_configuration: {},
};
let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];
let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];

// TinyMCE needs browser APIs that JSDOM does not provide.
jest.mock('@src/editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true,
  default: () => <div>HTML editor</div>,
  Footer: () => null,
  useEditorRef: () => ({ refReady: true, setEditorRef: jest.fn() }),
}));

const Navigation = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label="Current location">{pathname}</output>
      <button onClick={() => navigate(-1)}>Go back</button>
      <button onClick={() => navigate('/course/course-v1:edX+Other+Course/custom-pages')}>Open another course</button>
    </>
  );
};

const renderRoute = (route: string, previousRoute?: string) =>
  render(
    <>
      <Navigation />
      <CourseAuthoringRoutes />
    </>,
    {
      path: '/course/:courseId/*',
      routerProps: {
        initialEntries: previousRoute ?
          [`${coursePath}/${previousRoute}`, `${coursePath}/${route}`]
          : [`${coursePath}/${route}`],
      },
    },
  );

const setPermissions = (view: boolean, manage: boolean) => {
  axiosMock.onPost(getAuthzApiUrl('v1/permissions/validate/me')).reply(({ data }) => {
    const permissions: PermissionValidationRequestItem[] = JSON.parse(data);
    return [
      200,
      permissions.map(permission => ({
        ...permission,
        allowed: permission.action === 'courses.view_pages_and_resources' ?
          view
          : permission.action === 'courses.manage_pages_and_resources'
          ? manage
          : false,
      })),
    ];
  });
};

describe('Pages & Resources route permissions', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    mocks.validateUserPermissionsMock.mockRestore();
    axiosMock.onGet(getApiWaffleFlagsUrl(courseId)).reply(200, { enableAuthzCourseAuthoring: true });
    axiosMock.onGet(getCourseDetailsUrl(courseId, 'abc123')).reply(200, {
      course_id: courseId,
      name: 'Test course',
      start: '2027-01-01T00:00:00Z',
    });
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, {});
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
      { id: 'calculator', name: 'Calculator', description: 'Course calculator', enabled: true },
      { id: 'ora_settings', name: 'ORA', description: 'Open response assessments', enabled: true },
    ]);
    axiosMock.onGet(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`).reply(200, {
      force_on_flexible_peer_openassessments: { value: false },
    });
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, [{ id: 'page-1', name: 'Course policies' }]);
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, discussionProviders);
    axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, discussionSettings);
    setPermissions(false, false);
  });

  it.each(['custom-pages', 'custom-pages/editor', 'pages-and-resources', 'pages-and-resources/ora_settings/settings'])(
    'denies a %s deep link without either permission before loading its content',
    async route => {
      renderRoute(route);

      expect(await screen.findByText(/You are not authorized to view this page/)).toBeVisible();
      expect(screen.queryByText('Course policies')).not.toBeInTheDocument();
      expect(axiosMock.history.get.some(request => request.url === getTabHandlerUrl(courseId))).toBe(false);
      expect(axiosMock.history.get.some(request => request.url === `${getCourseAppsApiUrl()}/${courseId}`)).toBe(false);
    },
  );

  it.each([
    [true, false],
    [false, true],
    [true, true],
  ])('allows both listings with view=%s and manage=%s', async (view, manage) => {
    setPermissions(view, manage);
    const user = userEvent.setup();
    renderRoute('custom-pages');

    expect(await screen.findByText('Course policies')).toBeVisible();
    if (manage) {
      expect(screen.getByRole('button', { name: 'New page' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Add a new page' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Hide/show page from learners' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Drag to reorder' })).toBeEnabled();
    }
    await user.click(screen.getByRole('link', { name: 'Pages and Resources' }));
    expect(await screen.findByRole('heading', { name: 'Pages & Resources' })).toBeVisible();
    expect(screen.queryByText(/You are not authorized/)).not.toBeInTheDocument();
  });

  it('lets view-only users consult Custom Pages with disabled management actions', async () => {
    setPermissions(true, false);
    const user = userEvent.setup();
    renderRoute('custom-pages');

    expect(await screen.findByText('Course policies')).toBeVisible();
    const actions = [
      screen.getByRole('button', { name: 'New page' }),
      screen.getByRole('button', { name: 'Add a new page' }),
      screen.getByRole('button', { name: 'Edit' }),
      screen.getByRole('button', { name: 'Delete' }),
      screen.getByRole('button', { name: 'Hide/show page from learners' }),
    ];
    for (const action of actions) {
      expect(action).toBeDisabled();
      await user.click(action);
    }
    expect(screen.queryByRole('button', { name: 'Drag to reorder' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View live' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'See an example' }));
    expect(await screen.findByRole('dialog', { name: 'Pages in Your Course' })).toBeVisible();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(axiosMock.history.delete).toHaveLength(0);
    expect(axiosMock.history.post.every(request => request.url === getAuthzApiUrl('v1/permissions/validate/me')))
      .toBe(true);
  });

  it('prevents pointer and keyboard reordering for view-only users', async () => {
    setPermissions(true, false);
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, [
      { id: 'page-1', name: 'Course policies' },
      { id: 'page-2', name: 'Calendar' },
    ]);
    const user = userEvent.setup();
    renderRoute('custom-pages');

    const policies = await screen.findByText('Course policies');
    const calendar = screen.getByText('Calendar');
    expect(screen.queryByRole('button', { name: 'Drag to reorder' })).not.toBeInTheDocument();
    await user.pointer([
      { target: policies, keys: '[MouseLeft>]' },
      { target: calendar },
      { keys: '[/MouseLeft]' },
    ]);
    await user.click(policies);
    await user.keyboard('[Space][ArrowDown][Space]');

    expect(screen.getAllByText(/^(Course policies|Calendar)$/)).toEqual([policies, calendar]);
    expect(axiosMock.history.post.some(request => request.url === `${getTabHandlerUrl(courseId)}/reorder`)).toBe(false);
  });

  it.each([
    'ora_settings/settings',
    'calculator/settings',
    'discussion',
    'discussion/settings',
    'discussion/configure/piazza',
  ])('redirects a view-only %s deep link without mounting settings', async route => {
    setPermissions(true, false);
    renderRoute(`pages-and-resources/${route}`);

    await waitFor(() =>
      expect(screen.getByLabelText('Current location').textContent)
        .toBe(`${coursePath}/pages-and-resources`)
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axiosMock.history.get.some(request => request.url === `${getCourseAdvancedSettingsApiUrl()}/${courseId}`))
      .toBe(false);
    expect(axiosMock.history.get.some(request => request.url === getDiscussionsProvidersUrl(courseId))).toBe(false);
    expect(axiosMock.history.get.some(request => request.url === getDiscussionsSettingsUrl(courseId))).toBe(false);
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it.each([
    ['calculator/settings', 'Configure calculator'],
    ['ora_settings/settings', 'Configure Flexible Peer Grading'],
    ['discussion', 'Configure discussions'],
    ['discussion/settings', 'Configure discussions'],
    ['discussion/configure/piazza', 'Configure discussions'],
  ])('lets managers open %s', async (route, title) => {
    setPermissions(false, true);
    renderRoute(`pages-and-resources/${route}`);

    expect(await screen.findByRole('dialog', { name: title })).toBeVisible();
    expect(screen.getByLabelText('Current location').textContent).toBe(`${coursePath}/pages-and-resources/${route}`);
    if (!route.startsWith('discussion')) {
      expect(screen.getByRole('button', { name: /Save/ })).toBeEnabled();
    }
  });

  it('replaces the blocked settings history entry', async () => {
    setPermissions(true, false);
    const user = userEvent.setup();
    renderRoute('pages-and-resources/ora_settings/settings', 'custom-pages');

    await waitFor(() =>
      expect(screen.getByLabelText('Current location').textContent)
        .toBe(`${coursePath}/pages-and-resources`)
    );
    await user.click(screen.getByRole('button', { name: 'Go back' }));
    expect(await screen.findByText('Course policies')).toBeVisible();
    expect(screen.getByLabelText('Current location').textContent).toBe(`${coursePath}/custom-pages`);
  });

  it.each(['custom-pages', 'pages-and-resources/ora_settings/settings'])(
    'withholds %s while permission validation is pending',
    async route => {
      let finishValidation!: () => void;
      const pending = new Promise<void>(resolve => {
        finishValidation = resolve;
      });
      axiosMock.onPost(getAuthzApiUrl('v1/permissions/validate/me')).reply(async ({ data }) => {
        await pending;
        const permissions: PermissionValidationRequestItem[] = JSON.parse(data);
        return [200, permissions.map(permission => ({ ...permission, allowed: true }))];
      });
      renderRoute(route);

      await waitFor(() => expect(axiosMock.history.post.length).toBeGreaterThan(0));
      expect(screen.queryByText('Course policies')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(axiosMock.history.get.some(request => request.url === getTabHandlerUrl(courseId))).toBe(false);
      expect(axiosMock.history.get.some(request => request.url === `${getCourseAppsApiUrl()}/${courseId}`)).toBe(false);

      await act(async () => {
        finishValidation();
      });
      if (route === 'custom-pages') {
        expect(await screen.findByText('Course policies')).toBeVisible();
      } else {
        expect(await screen.findByRole('dialog', { name: 'Configure Flexible Peer Grading' })).toBeVisible();
      }
    },
  );

  it.each(['custom-pages', 'pages-and-resources'])(
    'fails closed on %s when permission validation fails',
    async route => {
      axiosMock.onPost(getAuthzApiUrl('v1/permissions/validate/me')).reply(500);
      renderRoute(route);
      expect(await screen.findByText(/You are not authorized to view this page/)).toBeVisible();
      expect(axiosMock.history.get.some(request => request.url === getTabHandlerUrl(courseId))).toBe(false);
      expect(axiosMock.history.get.some(request => request.url === `${getCourseAppsApiUrl()}/${courseId}`)).toBe(false);
    },
  );

  it.each(['custom-pages', 'pages-and-resources'])(
    'fails closed on %s when permissions are missing',
    async route => {
      axiosMock.onPost(getAuthzApiUrl('v1/permissions/validate/me')).reply(200, []);
      renderRoute(route);
      expect(await screen.findByText(/You are not authorized to view this page/)).toBeVisible();
    },
  );

  it.each(['custom-pages', 'pages-and-resources/calculator/settings'])(
    'preserves legacy access to %s with AuthZ disabled',
    async route => {
      axiosMock.onGet(getApiWaffleFlagsUrl(courseId)).reply(200, { enableAuthzCourseAuthoring: false });
      renderRoute(route);
      if (route === 'custom-pages') {
        expect(await screen.findByText('Course policies')).toBeVisible();
        expect(screen.getByRole('button', { name: 'New page' })).toBeEnabled();
      } else {
        expect(await screen.findByRole('dialog', { name: 'Configure calculator' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
      }
      expect(axiosMock.history.post).toHaveLength(0);
    },
  );

  it('lets managers add a custom page', async () => {
    setPermissions(true, true);
    let pages = [{ id: 'page-1', name: 'Course policies' }];
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(() => [200, pages]);
    axiosMock.onPut(`${getApiBaseUrl()}/xblock/`).reply(() => {
      pages = [...pages, { id: 'page-2', name: 'New course page' }];
      return [200, { locator: 'page-2', course_key: courseId }];
    });
    const user = userEvent.setup();
    renderRoute('custom-pages');

    await user.click(await screen.findByRole('button', { name: 'New page' }));
    expect(await screen.findByText('New course page')).toBeVisible();
    expect(axiosMock.history.put).toHaveLength(1);
  });

  it('keeps pending Add Page actions unavailable to managers', async () => {
    setPermissions(true, true);
    let finishAdding!: () => void;
    const pending = new Promise<void>(resolve => {
      finishAdding = resolve;
    });
    axiosMock.onPut(`${getApiBaseUrl()}/xblock/`).reply(async () => {
      await pending;
      return [200, { locator: 'page-2', course_key: courseId }];
    });
    const user = userEvent.setup();
    renderRoute('custom-pages');

    await user.click(await screen.findByRole('button', { name: 'Add a new page' }));
    const pendingButton = await screen.findByRole('button', { name: 'Adding a new page' });
    expect(pendingButton).toHaveAttribute('aria-disabled', 'true');
    await user.click(pendingButton);
    expect(axiosMock.history.put).toHaveLength(1);
    await act(async () => {
      finishAdding();
    });
    expect(await screen.findByRole('button', { name: 'Add a new page' })).toBeEnabled();
  });

  it('uses the destination course permissions when switching courses', async () => {
    setPermissions(true, true);
    const otherCourseId = 'course-v1:edX+Other+Course';
    axiosMock.onGet(getApiWaffleFlagsUrl(otherCourseId)).reply(200, { enableAuthzCourseAuthoring: true });
    axiosMock.onGet(getCourseDetailsUrl(otherCourseId, 'abc123')).reply(200, {
      course_id: otherCourseId,
      name: 'Other course',
    });
    axiosMock.onGet(getTabHandlerUrl(otherCourseId)).reply(200, [{ id: 'secret', name: 'Other course page' }]);
    axiosMock.onPost(getAuthzApiUrl('v1/permissions/validate/me')).reply(({ data }) => {
      const permissions: PermissionValidationRequestItem[] = JSON.parse(data);
      return [200, permissions.map(permission => ({ ...permission, allowed: permission.scope === courseId }))];
    });
    const user = userEvent.setup();
    renderRoute('custom-pages');

    expect(await screen.findByText('Course policies')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Open another course' }));
    expect(await screen.findByText(/You are not authorized to view this page/)).toBeVisible();
    expect(screen.queryByText('Course policies')).not.toBeInTheDocument();
    expect(screen.queryByText('Other course page')).not.toBeInTheDocument();
    expect(axiosMock.history.get.some(request => request.url === getTabHandlerUrl(otherCourseId))).toBe(false);
  });

  it('does not apply Pages & Resources permissions to Course Updates', async () => {
    axiosMock.onGet(getCourseUpdatesApiUrl(courseId)).reply(200, []);
    axiosMock.onGet(getCourseHandoutApiUrl(courseId)).reply(200, { data: 'Course handouts' });
    axiosMock.onPost(getAuthzApiUrl('v1/permissions/validate/me')).reply(({ data }) => {
      const permissions: PermissionValidationRequestItem[] = JSON.parse(data);
      return [
        200,
        permissions.map(permission => ({
          ...permission,
          allowed: permission.action === 'courses.view_course_updates',
        })),
      ];
    });
    renderRoute('course_info');

    expect(await screen.findByRole('heading', { name: /Course updates/ })).toBeVisible();
    expect(screen.queryByText(/You are not authorized/)).not.toBeInTheDocument();
  });
});
