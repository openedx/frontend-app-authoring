import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { LinkCheckResult } from '../types';
import type { LinkCheckStatusTypes, RawRerunLinkUpdateStatus, RerunLinkUpdateStatus } from './constants';

/** The partial response returned by the link-check status endpoint. */
export interface LinkCheckStatusApiResponseBody {
  linkCheckStatus?: LinkCheckStatusTypes | null;
  linkCheckOutput?: LinkCheckResult | null;
  linkCheckCreatedAt?: string | null;
}

export interface LinkCheckResponseBody {
  linkCheckStatus: LinkCheckStatusTypes;
}

export interface RerunLinkUpdateRequestBody {
  action: 'all' | 'single';
  data?: Array<{
    url: string;
    type: string;
    id: string;
  }>;
}

export interface RerunLinkUpdateResultApiResponse {
  id: string;
  success: boolean;
  newUrl?: string | null;
  originalUrl?: string | null;
  type: string;
}

/** The partial response returned by the rerun status endpoint. */
export interface RerunLinkUpdateStatusApiResponseBody {
  status?: RawRerunLinkUpdateStatus | null;
  /** Optional in the API contract; pending and failed responses may omit results. */
  results?: RerunLinkUpdateResultApiResponse[];
}

export interface RerunLinkUpdateResponseBody {
  status: RerunLinkUpdateStatus;
}

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const postLinkCheckCourseApiUrl = (courseId: string) =>
  new URL(`api/contentstore/v0/link_check/${courseId}`, getApiBaseUrl()).href;
export const getLinkCheckStatusApiUrl = (courseId: string) =>
  new URL(`api/contentstore/v0/link_check_status/${courseId}`, getApiBaseUrl()).href;
export const postRerunLinkUpdateApiUrl = (courseId: string) =>
  new URL(`api/contentstore/v0/rerun_link_update/${courseId}`, getApiBaseUrl()).href;
export const getRerunLinkUpdateStatusApiUrl = (courseId: string) =>
  new URL(`api/contentstore/v0/rerun_link_update_status/${courseId}`, getApiBaseUrl()).href;

export async function postLinkCheck(
  courseId: string,
): Promise<LinkCheckResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postLinkCheckCourseApiUrl(courseId));
  return camelCaseObject(data);
}

export async function getLinkCheckStatus(courseId: string): Promise<LinkCheckStatusApiResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getLinkCheckStatusApiUrl(courseId));
  return camelCaseObject(data);
}

export async function postRerunLinkUpdateAll(courseId: string): Promise<RerunLinkUpdateResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postRerunLinkUpdateApiUrl(courseId), {
      action: 'all',
    });
  return camelCaseObject(data);
}

export async function postRerunLinkUpdateSingle(
  courseId: string,
  linkUrl: string,
  blockId: string,
  contentType: string = 'course_updates',
): Promise<RerunLinkUpdateResponseBody> {
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
