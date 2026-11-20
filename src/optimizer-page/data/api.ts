import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { LinkCheckResult } from '../types';
import type { LinkCheckStatusTypes, RawRerunLinkUpdateStatus, RerunLinkUpdateStatus } from './constants';

/** The latest link check of a course, as the server sends it (camel-cased), with its report. */
interface LinkCheckApiResponse {
  status: LinkCheckStatusTypes;
  createdAt: string | null;
  error: string | null;
  /** Null unless the run succeeded. */
  output?: LinkCheckResult | null;
}

/** A run the server has just queued. */
interface QueuedRunApiResponse {
  status: LinkCheckStatusTypes;
}

/** The latest link check of a course, with the member names the optimizer page reads. */
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
const getLinkCheckApiUrl = (courseId: string) =>
  new URL(`api/authoring/v1/courses/${courseId}/link_check/`, getApiBaseUrl()).href;
const getPreviousRunLinkUpdateApiUrl = (courseId: string) =>
  new URL(`api/authoring/v1/courses/${courseId}/previous_run_link_update/`, getApiBaseUrl()).href;
// Starting a run and reading the latest run share one address, with POST and GET.
export const postLinkCheckCourseApiUrl = getLinkCheckApiUrl;
export const getLinkCheckStatusApiUrl = getLinkCheckApiUrl;
export const postRerunLinkUpdateApiUrl = getPreviousRunLinkUpdateApiUrl;
export const getRerunLinkUpdateStatusApiUrl = getPreviousRunLinkUpdateApiUrl;

export async function postLinkCheck(
  courseId: string,
): Promise<LinkCheckResponseBody> {
  const { data } = await getAuthenticatedHttpClient()
    .post(postLinkCheckCourseApiUrl(courseId));
  const run: QueuedRunApiResponse = camelCaseObject(data);
  return { linkCheckStatus: run.status };
}

export async function getLinkCheckStatus(courseId: string): Promise<LinkCheckStatusApiResponseBody> {
  // The report of a finished check is only sent with view=full.
  const { data } = await getAuthenticatedHttpClient()
    .get(getLinkCheckStatusApiUrl(courseId), { params: { view: 'full' } });
  const linkCheck: LinkCheckApiResponse = camelCaseObject(data);
  return {
    linkCheckStatus: linkCheck.status,
    linkCheckOutput: linkCheck.output,
    linkCheckCreatedAt: linkCheck.createdAt,
  };
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
  // The outcome of each link is only sent with view=full.
  const { data } = await getAuthenticatedHttpClient()
    .get(getRerunLinkUpdateStatusApiUrl(courseId), { params: { view: 'full' } });
  return camelCaseObject(data);
}
