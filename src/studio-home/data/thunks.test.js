import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchStudioHomeData } from './thunks';
import { getApiBaseUrl, getStudioHomeApiUrl } from './api';
import {
  generateGetStudioCoursesApiResponseV2,
  generateGetStudioHomeDataApiResponse,
} from '../factories/mockApiResponses';

let axiosMock;
let dispatch;

describe('fetchStudioHomeData thunk', () => {
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
    dispatch = jest.fn();

    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
    axiosMock.onGet(new RegExp(`${getApiBaseUrl()}/api/contentstore/v2/home/courses.*`))
      .reply(200, generateGetStudioCoursesApiResponseV2());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sync currentPage from requestParams.page after fetching courses', async () => {
    const requestParams = { page: 3 };
    await fetchStudioHomeData('', false, requestParams)(dispatch);

    const updateParamsCall = dispatch.mock.calls.find(
      ([action]) => action.type === 'studioHome/updateStudioHomeCoursesCustomParams',
    );
    expect(updateParamsCall).toBeDefined();
    expect(updateParamsCall[0].payload).toEqual({ currentPage: 3 });
  });

  it('should sync currentPage from search query string when page is not in requestParams', async () => {
    await fetchStudioHomeData('?page=2', false, {})(dispatch);

    const updateParamsCall = dispatch.mock.calls.find(
      ([action]) => action.type === 'studioHome/updateStudioHomeCoursesCustomParams',
    );
    expect(updateParamsCall).toBeDefined();
    expect(updateParamsCall[0].payload).toEqual({ currentPage: 2 });
  });

  it('should default currentPage to 1 when page is not specified anywhere', async () => {
    await fetchStudioHomeData('', false, {})(dispatch);

    const updateParamsCall = dispatch.mock.calls.find(
      ([action]) => action.type === 'studioHome/updateStudioHomeCoursesCustomParams',
    );
    expect(updateParamsCall).toBeDefined();
    expect(updateParamsCall[0].payload).toEqual({ currentPage: 1 });
  });

  it('should prefer requestParams.page over search query string page', async () => {
    const requestParams = { page: 5 };
    await fetchStudioHomeData('?page=2', false, requestParams)(dispatch);

    const updateParamsCall = dispatch.mock.calls.find(
      ([action]) => action.type === 'studioHome/updateStudioHomeCoursesCustomParams',
    );
    expect(updateParamsCall).toBeDefined();
    expect(updateParamsCall[0].payload).toEqual({ currentPage: 5 });
  });
});
