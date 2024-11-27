import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import mockApiResponse from '../mocks/mockApiResponse';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postLinkCheckCourseApiUrl = (courseId) => new URL(`link_check/${courseId}`, getApiBaseUrl()).href;
export const getLinkCheckStatusApiUrl = (courseId) => new URL(`link_check_status/${courseId}`, getApiBaseUrl()).href;

export async function postLinkCheck(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(postLinkCheckCourseApiUrl(courseId));
  // return camelCaseObject(data);
  return mockApiResponse;
}

export async function getLinkCheckStatus(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getLinkCheckStatusApiUrl(courseId));
  // return camelCaseObject(data);
  return mockApiResponse;
}
