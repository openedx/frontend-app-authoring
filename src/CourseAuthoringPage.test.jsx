import { getConfig } from '@edx/frontend-platform';

import CourseAuthoringPage from './CourseAuthoringPage';
import PagesAndResources from './pages-and-resources/PagesAndResources';
import { executeThunk } from './utils';
import { fetchCourseApps } from './pages-and-resources/data/thunks';
import { fetchCourseDetail, fetchWaffleFlags } from './data/thunks';
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
  await executeThunk(fetchWaffleFlags(courseId), store.dispatch);
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
      </CourseAuthoringPage>
      ,
    );
    expect(wrapper.queryByRole('status')).not.toBeInTheDocument();
  });
  test('renders loading wheel on non editor pages', async () => {
    mockPathname = '/evilguy/';
    await mockStoreSuccess();
    const wrapper = render(
      <CourseAuthoringPage courseId={courseId}>
        <PagesAndResources courseId={courseId} />
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
      </CourseAuthoringPage>
      ,
    );
    expect(await wrapper.findByTestId(contentTestId)).toBeInTheDocument();
    expect(wrapper.queryByTestId('notFoundAlert')).not.toBeInTheDocument();
  });
});
