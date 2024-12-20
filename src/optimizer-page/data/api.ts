import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { LinkCheckResult } from '../types';
import { LinkCheckStatusTypes } from './constants';

export interface LinkCheckStatusApiResponseBody {
  linkCheckStatus: LinkCheckStatusTypes;
  linkCheckOutput: LinkCheckResult;
  linkCheckCreatedAt: string;
}

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postLinkCheckCourseApiUrl = (courseId) => new URL(`api/contentstore/v0/link_check/${courseId}`, getApiBaseUrl()).href;
export const getLinkCheckStatusApiUrl = (courseId) => new URL(`api/contentstore/v0/link_check_status/${courseId}`, getApiBaseUrl()).href;

export async function postLinkCheck(courseId: string): Promise<{ linkCheckStatus: LinkCheckStatusTypes }> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postLinkCheckCourseApiUrl(courseId));
  return camelCaseObject(data);
}

export async function getLinkCheckStatus(courseId: string): Promise<LinkCheckStatusApiResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getLinkCheckStatusApiUrl(courseId));
  return camelCaseObject(data);
}
