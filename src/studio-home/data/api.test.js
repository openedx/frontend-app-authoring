import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { studioHomeMock } from '../__mocks__';
import {
  getStudioHomeApiUrl,
  getRequestCourseCreatorUrl,
  getCourseNotificationUrl,
  getStudioHomeData,
  handleCourseNotification,
  sendRequestForCourseCreator,
} from './api';

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
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    const result = await getStudioHomeData();

    expect(axiosMock.history.get[0].url).toEqual(getStudioHomeApiUrl());
    expect(result).toEqual(studioHomeMock);
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
