import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  getStudioHomeApiUrl,
  getRequestCourseCreatorUrl,
  getCourseNotificationUrl,
  getStudioHomeData,
  handleCourseNotification,
  sendRequestForCourseCreator,
  getApiBaseUrl,
  getStudioHomeCourses,
  getStudioHomeCoursesV2,
  getStudioHomeLibraries,
} from './api';
import {
  generateGetStudioCoursesApiResponse,
  generateGetStudioHomeDataApiResponse,
  generateGetStudioHomeLibrariesApiResponse,
} from '../factories/mockApiResponses';

let axiosMock;

describe('studio-home api calls', () => {
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

  it('should get studio home data', async () => {
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
    const result = await getStudioHomeData();
    const expected = generateGetStudioHomeDataApiResponse();

    expect(axiosMock.history.get[0].url).toEqual(getStudioHomeApiUrl());
    expect(result).toEqual(expected);
  });

  it('should get studio courses data', async () => {
    const apiLink = `${getApiBaseUrl()}/api/contentstore/v1/home/courses`;
    axiosMock.onGet(apiLink).reply(200, generateGetStudioCoursesApiResponse());
    const result = await getStudioHomeCourses('');
    const expected = generateGetStudioCoursesApiResponse();

    expect(axiosMock.history.get[0].url).toEqual(apiLink);
    expect(result).toEqual(expected);
  });

  it('should get studio courses data v2', async () => {
    const apiLink = `${getApiBaseUrl()}/api/contentstore/v2/home/courses`;
    axiosMock.onGet(apiLink).reply(200, generateGetStudioCoursesApiResponse());
    const result = await getStudioHomeCoursesV2('');
    const expected = generateGetStudioCoursesApiResponse();

    expect(axiosMock.history.get[0].url).toEqual(apiLink);
    expect(result).toEqual(expected);
  });

  it('should get studio v1 libraries data', async () => {
    const apiLink = `${getApiBaseUrl()}/api/contentstore/v1/home/libraries`;
    axiosMock.onGet(apiLink).reply(200, generateGetStudioHomeLibrariesApiResponse());
    const result = await getStudioHomeLibraries();
    const expected = generateGetStudioHomeLibrariesApiResponse();

    expect(axiosMock.history.get[0].url).toEqual(apiLink);
    expect(result).toEqual(expected);
  });

  it('should handle course notification request', async () => {
    const dismissLink = 'to://dismiss-link';
    const successResponse = { status: 'OK' };
    axiosMock.onDelete(getCourseNotificationUrl(dismissLink)).reply(200, successResponse);
    const result = await handleCourseNotification(dismissLink);

    expect(axiosMock.history.delete[0].url).toEqual(getCourseNotificationUrl(dismissLink));
    expect(result).toEqual(successResponse);
  });

  it('should send request to course creating access', async () => {
    const successResponse = { status: 'OK' };
    axiosMock.onPost(getRequestCourseCreatorUrl()).reply(200, successResponse);
    const result = await sendRequestForCourseCreator();

    expect(axiosMock.history.post[0].url).toEqual(getRequestCourseCreatorUrl());
    expect(result).toEqual(successResponse);
  });
});
