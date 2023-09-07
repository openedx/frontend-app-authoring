import React from 'react';

import { render } from '@testing-library/react';

import { getConfig, initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import initializeStore from './store';
import CourseAuthoringPage from './CourseAuthoringPage';
import PagesAndResources from './pages-and-resources/PagesAndResources';
import { executeThunk } from './utils';
import { fetchCourseApps } from './pages-and-resources/data/thunks';

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

describe('Editor Pages Load no header', () => {
  const mockStoreSuccess = async () => {
    const apiBaseUrl = getConfig().STUDIO_BASE_URL;
    const courseAppsApiUrl = `${apiBaseUrl}/api/course_apps/v1/apps`;
    axiosMock.onGet(`${courseAppsApiUrl}/${courseId}`).reply(200, {
      response: { status: 200 },
    });
    await executeThunk(fetchCourseApps(courseId), store.dispatch);
  };
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
  test('renders no loading wheel on editor pages', async () => {
    mockPathname = '/editor/';
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
