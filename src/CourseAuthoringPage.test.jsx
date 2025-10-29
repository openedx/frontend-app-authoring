import { getConfig } from '@edx/frontend-platform';

import CourseAuthoringPage from './CourseAuthoringPage';
import PagesAndResources from './pages-and-resources/PagesAndResources';
import { executeThunk } from './utils';
import { fetchCourseApps } from './pages-and-resources/data/thunks';
import { fetchCourseDetail, retryConfig } from './data/thunks';
import { getApiWaffleFlagsUrl } from './data/api';
import { initializeMocks, render } from './testUtils';

const courseId = 'course-v1:edX+TestX+Test_Course';
let mockPathname = '/evilguy/';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));
let axiosMock;
let store;

beforeEach(async () => {
  const mocks = initializeMocks();
  store = mocks.reduxStore;
  axiosMock = mocks.axiosMock;
  axiosMock
    .onGet(getApiWaffleFlagsUrl(courseId))
    .reply(200, {});
});

describe('Editor Pages Load no header', () => {
  const mockStoreSuccess = async () => {
    const apiBaseUrl = getConfig().STUDIO_BASE_URL;
    const courseAppsApiUrl = `${apiBaseUrl}/api/course_apps/v1/apps`;
    axiosMock.onGet(`${courseAppsApiUrl}/${courseId}`).reply(200, {
      response: { status: 200 },
    });
    await executeThunk(fetchCourseApps(courseId), store.dispatch);
  };
  test('renders no loading wheel on editor pages', async () => {
    mockPathname = '/editor/';
    await mockStoreSuccess();
    const wrapper = render(
      <CourseAuthoringPage courseId={courseId}>
        <PagesAndResources courseId={courseId} />
      </CourseAuthoringPage>,
    );
    expect(wrapper.queryByRole('status')).not.toBeInTheDocument();
  });
  test('renders loading wheel on non editor pages', async () => {
    mockPathname = '/evilguy/';
    await mockStoreSuccess();
    const wrapper = render(
      <CourseAuthoringPage courseId={courseId}>
        <PagesAndResources courseId={courseId} />
      </CourseAuthoringPage>,
    );
    expect(wrapper.queryByRole('status')).toBeInTheDocument();
  });
});

describe('Course authoring page', () => {
  const lmsApiBaseUrl = getConfig().LMS_BASE_URL;
  const courseDetailApiUrl = `${lmsApiBaseUrl}/api/courses/v1/courses`;

  beforeAll(() => {
    retryConfig.enabled = false;
  });

  afterAll(() => {
    retryConfig.enabled = true;
  });

  const mockStoreNotFound = async () => {
    axiosMock.onGet(
      `${courseDetailApiUrl}/${courseId}?username=abc123`,
    ).reply(404, {
      response: { status: 404 },
    });
    await executeThunk(fetchCourseDetail(courseId), store.dispatch);
  };

  const mockStoreError = async () => {
    axiosMock.onGet(
      `${courseDetailApiUrl}/${courseId}?username=abc123`,
    ).reply(500, {
      response: { status: 500 },
    });
    await executeThunk(fetchCourseDetail(courseId), store.dispatch);
  };

  test('renders not found page on non-existent course key', async () => {
    await mockStoreNotFound();
    const wrapper = render(<CourseAuthoringPage courseId={courseId} />);
    expect(await wrapper.findByTestId('notFoundAlert')).toBeInTheDocument();
  });

  test('does not render not found page on other kinds of error', async () => {
    await mockStoreError();
    // Currently, loading errors are not handled, so we wait for the child
    // content to be rendered -which happens when request status is no longer
    // IN_PROGRESS but also not NOT_FOUND or DENIED- then check that the not
    // found alert is not present.
    const contentTestId = 'courseAuthoringPageContent';
    const wrapper = render(
      <CourseAuthoringPage courseId={courseId}>
        <div data-testid={contentTestId} />
      </CourseAuthoringPage>,
    );
    expect(await wrapper.findByTestId(contentTestId)).toBeInTheDocument();
    expect(wrapper.queryByTestId('notFoundAlert')).not.toBeInTheDocument();
  });

  const mockStoreDenied = async () => {
    const studioApiBaseUrl = getConfig().STUDIO_BASE_URL;
    const courseAppsApiUrl = `${studioApiBaseUrl}/api/course_apps/v1/apps`;

    axiosMock.onGet(
      `${courseAppsApiUrl}/${courseId}`,
    ).reply(403);
    await executeThunk(fetchCourseApps(courseId), store.dispatch);
  };

  test('renders PermissionDeniedAlert when courseAppsApiStatus is DENIED', async () => {
    mockPathname = '/editor/';
    await mockStoreDenied();

    const wrapper = render(<CourseAuthoringPage courseId={courseId} />);
    expect(await wrapper.findByTestId('permissionDeniedAlert')).toBeInTheDocument();
  });
});

// New test suite for retry logic
describe('fetchCourseDetail retry logic', () => {
  const lmsApiBaseUrl = getConfig().LMS_BASE_URL;
  const courseDetailApiUrl = `${lmsApiBaseUrl}/api/courses/v1/courses`;

  beforeAll(() => {
    retryConfig.enabled = true;
    retryConfig.maxRetries = 3;
    retryConfig.initialDelay = 10;
  });

  afterAll(() => {
    retryConfig.enabled = false;
  });

  test('retries on 404 and eventually succeeds', async () => {
    const courseDetail = {
      id: courseId,
      name: 'Test Course',
      start: new Date().toISOString(),
    };

    axiosMock
      .onGet(`${courseDetailApiUrl}/${courseId}?username=abc123`)
      .replyOnce(404)
      .onGet(`${courseDetailApiUrl}/${courseId}?username=abc123`)
      .replyOnce(200, courseDetail);

    await executeThunk(fetchCourseDetail(courseId), store.dispatch);

    const state = store.getState();
    expect(state.courseDetail.courseId).toBe(courseId);
    expect(state.courseDetail.status).toBe('successful');
  });

  test('retries on 202 and eventually succeeds', async () => {
    const courseDetail = {
      id: courseId,
      name: 'Test Course',
      start: new Date().toISOString(),
    };

    axiosMock
      .onGet(`${courseDetailApiUrl}/${courseId}?username=abc123`)
      .replyOnce(202, { error: 'course_not_ready' })
      .onGet(`${courseDetailApiUrl}/${courseId}?username=abc123`)
      .replyOnce(200, courseDetail);

    await executeThunk(fetchCourseDetail(courseId), store.dispatch);

    const state = store.getState();
    expect(state.courseDetail.status).toBe('successful');
  });

  test('gives up after max retries on persistent 404', async () => {
    axiosMock
      .onGet(`${courseDetailApiUrl}/${courseId}?username=abc123`)
      .reply(404);

    await executeThunk(fetchCourseDetail(courseId), store.dispatch);

    const state = store.getState();
    expect(state.courseDetail.status).toBe('not-found');
  });

  test('does not retry on 500 errors', async () => {
    axiosMock
      .onGet(`${courseDetailApiUrl}/${courseId}?username=abc123`)
      .reply(500);

    await executeThunk(fetchCourseDetail(courseId), store.dispatch);

    const state = store.getState();
    expect(state.courseDetail.status).toBe('failed');

    expect(axiosMock.history.get.filter(
      req => req.url.includes(courseId),
    ).length).toBe(1);
  });

  test('respects retryConfig.enabled flag', async () => {
    retryConfig.enabled = false;

    axiosMock
      .onGet(`${courseDetailApiUrl}/${courseId}?username=abc123`)
      .reply(404);

    await executeThunk(fetchCourseDetail(courseId), store.dispatch);

    const state = store.getState();
    expect(state.courseDetail.status).toBe('not-found');

    expect(axiosMock.history.get.filter(
      req => req.url.includes(courseId),
    ).length).toBe(1);

    retryConfig.enabled = true;
  });
});
