import React from 'react';

import { render } from '@testing-library/react';

import { getConfig, initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import initializeStore from './store';
import CourseAuthoringPage from './CourseAuthoringPage';
import PagesAndResources from './pages-and-resources/PagesAndResources';
import { executeThunk } from './utils';
import { fetchCourseApps } from './pages-and-resources/data/thunks';
import { fetchCourseDetail } from './data/thunks';

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

beforeEach(() => {
  initializeMockApp({
    authenticatedUser: {
      userId: 3,
      username: 'abc123',
      administrator: true,
      roles: [],
    },
  });
  store = initializeStore();
  axiosMock = new MockAdapter(getAuthenticatedHttpClient());
});

const queryClient = new QueryClient();

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
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <QueryClientProvider client={queryClient}>
            <CourseAuthoringPage courseId={courseId}>
              <PagesAndResources courseId={courseId} />
            </CourseAuthoringPage>
          </QueryClientProvider>
        </IntlProvider>
      </AppProvider>
      ,
    );
    expect(wrapper.queryByRole('status')).not.toBeInTheDocument();
  });
  test('renders loading wheel on non editor pages', async () => {
    mockPathname = '/evilguy/';
    await mockStoreSuccess();
    const wrapper = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <CourseAuthoringPage courseId={courseId}>
            <PagesAndResources courseId={courseId} />
          </CourseAuthoringPage>
        </IntlProvider>
      </AppProvider>
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
    const wrapper = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <CourseAuthoringPage courseId={courseId} />
        </IntlProvider>
      </AppProvider>
      ,
    );
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
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <CourseAuthoringPage courseId={courseId}>
            <div data-testid={contentTestId} />
          </CourseAuthoringPage>
        </IntlProvider>
      </AppProvider>
      ,
    );
    expect(await wrapper.findByTestId(contentTestId)).toBeInTheDocument();
    expect(wrapper.queryByTestId('notFoundAlert')).not.toBeInTheDocument();
  });
});
