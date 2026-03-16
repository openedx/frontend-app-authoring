import { getConfig } from '@edx/frontend-platform';

import CourseAuthoringPage from './CourseAuthoringPage';
import PagesAndResources from './pages-and-resources/PagesAndResources';
import { executeThunk } from './utils';
import { fetchCourseApps } from './pages-and-resources/data/thunks';
import { getApiWaffleFlagsUrl } from './data/api';
import { initializeMocks, render } from './testUtils';
import { CourseAuthoringProvider } from './CourseAuthoringContext';

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

const renderComponent = children => render(
  <CourseAuthoringProvider courseId={courseId}>
    {children}
  </CourseAuthoringProvider>,
);

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
  };
  test('renders no loading wheel on editor pages', async () => {
    mockPathname = '/editor/';
    await mockStoreSuccess();
    const wrapper = renderComponent(
      <CourseAuthoringPage>
        <PagesAndResources />
      </CourseAuthoringPage>
      ,
    );
    expect(wrapper.queryByRole('status')).not.toBeInTheDocument();
  });
  test('renders loading wheel on non editor pages', async () => {
    mockPathname = '/evilguy/';
    await mockStoreSuccess();
    const wrapper = renderComponent(
      <CourseAuthoringPage>
        <PagesAndResources />
      </CourseAuthoringPage>
      ,
    );
    expect(wrapper.queryByRole('status')).toBeInTheDocument();
  });
});

describe('Course authoring page', () => {
  const lmsApiBaseUrl = getConfig().LMS_BASE_URL;
  const courseDetailApiUrl = `${lmsApiBaseUrl}/api/courses/v1/courses`;
  const mockStoreNotFound = async () => {
    axiosMock.onGet(
      `${courseDetailApiUrl}/${courseId}?username=abc123`,
    ).reply(404, {
      response: { status: 404 },
    });
  };
  const mockStoreError = async () => {
    axiosMock.onGet(
      `${courseDetailApiUrl}/${courseId}?username=abc123`,
    ).reply(500, {
      response: { status: 500 },
    });
  };
  test('renders not found page on non-existent course key', async () => {
    await mockStoreNotFound();
    const wrapper = renderComponent(<CourseAuthoringPage />);
    expect(await wrapper.findByTestId('notFoundAlert')).toBeInTheDocument();
  });
  test('does not render not found page on other kinds of error', async () => {
    await mockStoreError();
    // Currently, loading errors are not handled, so we wait for the child
    // content to be rendered -which happens when request status is no longer
    // IN_PROGRESS but also not NOT_FOUND or DENIED- then check that the not
    // found alert is not present.
    const contentTestId = 'courseAuthoringPageContent';
    const wrapper = renderComponent(
      <CourseAuthoringPage>
        <div data-testid={contentTestId} />
      </CourseAuthoringPage>
      ,
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

    const wrapper = renderComponent(<CourseAuthoringPage />);
    expect(await wrapper.findByTestId('permissionDeniedAlert')).toBeInTheDocument();
  });
});
