import React from 'react';
import {
  render, waitFor, cleanup,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  getCourseBestPracticesApiUrl,
  getCourseLaunchApiUrl,
  getCourseOutlineIndexApiUrl,
  getCourseReindexApiUrl,
  getEnableHighlightsEmailsApiUrl,
} from './data/api';
import {
  enableCourseHighlightsEmailsQuery,
  fetchCourseBestPracticesQuery,
  fetchCourseLaunchQuery,
  fetchCourseOutlineIndexQuery,
  fetchCourseReindexQuery,
} from './data/thunk';
import initializeStore from '../store';
import {
  courseOutlineIndexMock,
  courseBestPracticesMock,
  courseLaunchMock,
} from './__mocks__';
import { executeThunk } from '../utils';
import CourseOutline from './CourseOutline';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseOutline courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseOutline />', () => {
  beforeEach(async () => {
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
    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, courseOutlineIndexMock);
    await executeThunk(fetchCourseOutlineIndexQuery(courseId), store.dispatch);
  });

  it('render CourseOutline component correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    });
  });

  it('check reindex and render success alert is correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl(courseOutlineIndexMock.reindexLink))
      .reply(200);
    await executeThunk(fetchCourseReindexQuery(courseId, courseOutlineIndexMock.reindexLink), store.dispatch);

    expect(getByText(messages.alertSuccessDescription.defaultMessage)).toBeInTheDocument();
  });

  it('render error alert after failed reindex correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseReindexApiUrl('some link'))
      .reply(500);
    await executeThunk(fetchCourseReindexQuery(courseId, 'some link'), store.dispatch);

    expect(getByText(messages.alertErrorTitle.defaultMessage)).toBeInTheDocument();
  });

  it('render checklist value correctly', async () => {
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseBestPracticesApiUrl({
        courseId, excludeGraded: true, all: true,
      }))
      .reply(200, courseBestPracticesMock);

    axiosMock
      .onGet(getCourseLaunchApiUrl({
        courseId, gradedOnly: true, validateOras: true, all: true,
      }))
      .reply(200, courseLaunchMock);

    await executeThunk(fetchCourseLaunchQuery({
      courseId, gradedOnly: true, validateOras: true, all: true,
    }), store.dispatch);
    await executeThunk(fetchCourseBestPracticesQuery({
      courseId, excludeGraded: true, all: true,
    }), store.dispatch);

    expect(getByText('4/9 completed')).toBeInTheDocument();
  });

  it('check enable highlights when enable highlights query is successfully', async () => {
    cleanup();
    const { getByText } = render(<RootWrapper />);

    axiosMock
      .onGet(getCourseOutlineIndexApiUrl(courseId))
      .reply(200, {
        ...courseOutlineIndexMock,
        highlightsEnabledForMessaging: false,
      });

    axiosMock
      .onPost(getEnableHighlightsEmailsApiUrl(courseId), {
        publish: 'republish',
        metadata: {
          highlights_enabled_for_messaging: true,
        },
      })
      .reply(200);

    await executeThunk(enableCourseHighlightsEmailsQuery(courseId), store.dispatch);
    expect(getByText('Enabled')).toBeInTheDocument();
  });
});
