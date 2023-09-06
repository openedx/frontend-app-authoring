import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  createOrRerunCourse,
  getApiBaseUrl,
  getOrganizations,
  getCreateOrRerunCourseUrl,
  getCourseRerunUrl,
  getCourseRerun,
} from './api';

let axiosMock;

describe('generic api calls', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get organizations', async () => {
    const organizationsData = ['edX', 'org'];
    const queryUrl = new URL('organizations', getApiBaseUrl()).href;
    axiosMock.onGet(queryUrl).reply(200, organizationsData);
    const result = await getOrganizations();

    expect(axiosMock.history.get[0].url).toEqual(queryUrl);
    expect(result).toEqual(organizationsData);
  });

  it('should get course rerun', async () => {
    const courseId = 'course-mock-id';
    const courseRerunData = {
      allowUnicodeCourseId: false,
      courseCreatorStatus: 'granted',
      displayName: 'Demonstration Course',
      number: 'DemoX',
      org: 'edX',
      run: 'Demo_Course',
    };
    axiosMock.onGet(getCourseRerunUrl(courseId)).reply(200, courseRerunData);
    const result = await getCourseRerun(courseId);

    expect(axiosMock.history.get[0].url).toEqual(getCourseRerunUrl(courseId));
    expect(result).toEqual(courseRerunData);
  });

  it('should post create or rerun course', async () => {
    const courseRerunData = {
      allowUnicodeCourseId: false,
      courseCreatorStatus: 'granted',
      displayName: 'Demonstration Course',
      number: 'DemoX',
      org: 'edX',
      run: 'Demo_Course',
    };
    axiosMock.onPost(getCreateOrRerunCourseUrl).reply(200, courseRerunData);
    const result = await createOrRerunCourse(courseRerunData);

    expect(axiosMock.history.post[0].url).toEqual(getCreateOrRerunCourseUrl);
    expect(result).toEqual(courseRerunData);
  });
});
