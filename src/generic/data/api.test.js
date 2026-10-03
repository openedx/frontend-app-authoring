import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { contentTagsCountMock } from '../__mocks__';
import {
  createOrRerunCourse,
  getApiBaseUrl,
  getOrganizations,
  getCreateOrRerunCourseUrl,
  getCourseRerunUrl,
  getCourseRerun,
  getTagsCount,
  getTagsCountApiUrl,
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
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(200, courseRerunData);
    const result = await createOrRerunCourse(courseRerunData);

    expect(axiosMock.history.post[0].url).toEqual(getCreateOrRerunCourseUrl());
    expect(result).toEqual(courseRerunData);
  });

  it('should get tags count', async () => {
    const pattern = 'this,is,a,pattern';
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb06';
    axiosMock.onGet().reply(200, contentTagsCountMock);
    const result = await getTagsCount(pattern);
    expect(axiosMock.history.get[0].url).toEqual(getTagsCountApiUrl(pattern));
    expect(result).toEqual(contentTagsCountMock);
    expect(contentTagsCountMock[contentId]).toEqual(15);
  });

  it.each([null, undefined, ''])('accepts an empty successful create response (%s)', async (body) => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(201, body);
    await expect(createOrRerunCourse({ displayName: 'New course' })).resolves.toEqual({});
    expect(axiosMock.history.post).toHaveLength(1);
  });

  it('uses a same-origin Studio course redirect for an empty response', async () => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(201, '', {
      location: new URL('/course/course-v1:Test+Demo+2026?created=1', getApiBaseUrl()).href,
    });
    await expect(createOrRerunCourse({})).resolves.toEqual({ url: '/course/course-v1:Test+Demo+2026?created=1' });
  });

  it.each(['https://foreign.example/course/id', '/login', '/course/', '/login/next/course/id'])(
    'does not expose an unrelated redirect %s',
    async (location) => {
      axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(201, '', { location });
      await expect(createOrRerunCourse({})).resolves.toEqual({});
    },
  );

  it('preserves backend rejection instead of normalizing it to an empty success', async () => {
    axiosMock.onPost(getCreateOrRerunCourseUrl()).reply(400, { error: 'Course number already exists' });
    await expect(createOrRerunCourse({})).rejects.toBeDefined();
  });

  it('should throw an error if no pattern is provided', async () => {
    const pattern = undefined;
    await expect(getTagsCount(pattern)).rejects.toThrow('contentPattern is required');
    expect(axiosMock.history.get.length).toEqual(0);
  });
});
