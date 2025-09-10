import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { LinkCheckResult } from '../types';
import { LinkCheckStatusTypes } from './constants';

export interface LinkCheckStatusApiResponseBody {
  linkCheckStatus: LinkCheckStatusTypes;
  linkCheckOutput: LinkCheckResult;
  linkCheckCreatedAt: string;
}

export interface RerunLinkUpdateRequestBody {
  action: 'all' | 'single';
  data?: Array<{
    url: string;
    type: string;
    id: string;
  }>;
}

export interface RerunLinkUpdateStatusApiResponseBody {
  updateStatus: string;
  status: string;
  results?: Array<{
    id: string;
    success: boolean;
    new_url: string;
    original_url: string;
    type: string;
  }>;
}

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postLinkCheckCourseApiUrl = (courseId) => new URL(`api/contentstore/v0/link_check/${courseId}`, getApiBaseUrl()).href;
export const getLinkCheckStatusApiUrl = (courseId) => new URL(`api/contentstore/v0/link_check_status/${courseId}`, getApiBaseUrl()).href;
export const postRerunLinkUpdateApiUrl = (courseId) => new URL(`api/contentstore/v0/rerun_link_update/${courseId}`, getApiBaseUrl()).href;
export const getRerunLinkUpdateStatusApiUrl = (courseId) => new URL(`api/contentstore/v0/rerun_link_update_status/${courseId}`, getApiBaseUrl()).href;

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

export async function postRerunLinkUpdateAll(courseId: string): Promise<RerunLinkUpdateStatusApiResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postRerunLinkUpdateApiUrl(courseId), {
      action: 'all',
    });
  return camelCaseObject(data);
}

export async function postRerunLinkUpdateSingle(courseId: string, linkUrl: string, blockId: string, contentType: string = 'course_updates'): Promise<RerunLinkUpdateStatusApiResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postRerunLinkUpdateApiUrl(courseId), {
      action: 'single',
      data: [
        {
          id: blockId,
          type: contentType,
          url: linkUrl,
        },
      ],
    });
  return camelCaseObject(data);
}

export async function getRerunLinkUpdateStatus(courseId: string): Promise<RerunLinkUpdateStatusApiResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getRerunLinkUpdateStatusApiUrl(courseId));
  return camelCaseObject(data);
}
