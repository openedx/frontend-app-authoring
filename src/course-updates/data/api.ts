import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export interface CourseUpdate {
  id: number;
  date: string;
  content: string;
}

export interface CourseHandouts {
  data?: string;
  [key: string]: unknown;
}

export type CourseUpdateInput = Omit<CourseUpdate, 'id'> & { id?: number; };

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseUpdatesApiUrl = (courseId: string) => `${getApiBaseUrl()}/course_info_update/${courseId}/`;
export const updateCourseUpdatesApiUrl = (courseId: string, updateId: number) =>
  `${getApiBaseUrl()}/course_info_update/${courseId}/${updateId}`;
export const getCourseHandoutApiUrl = (courseId: string) => {
  // Handouts are served by the block-v1 XBlock endpoint, so transform the course-v1 ID.
  const formattedCourseId = courseId.split('course-v1:')[1];
  return `${getApiBaseUrl()}/xblock/block-v1:${formattedCourseId}+type@course_info+block@handouts`;
};

export async function getCourseUpdates(courseId: string): Promise<CourseUpdate[]> {
  const { data } = await getAuthenticatedHttpClient().get<CourseUpdate[]>(getCourseUpdatesApiUrl(courseId));
  return data;
}

export async function createUpdate(courseId: string, courseUpdate: CourseUpdateInput): Promise<CourseUpdate> {
  const { data } = await getAuthenticatedHttpClient().post<CourseUpdate>(
    getCourseUpdatesApiUrl(courseId),
    courseUpdate,
  );
  return data;
}

export async function editUpdate(courseId: string, courseUpdate: CourseUpdate): Promise<CourseUpdate> {
  const { data } = await getAuthenticatedHttpClient().put<CourseUpdate>(
    updateCourseUpdatesApiUrl(courseId, courseUpdate.id),
    courseUpdate,
  );
  return data;
}

export async function deleteUpdate(courseId: string, updateId: number): Promise<CourseUpdate[]> {
  const { data } = await getAuthenticatedHttpClient().delete<CourseUpdate[]>(
    updateCourseUpdatesApiUrl(courseId, updateId),
  );
  return data;
}

export async function getCourseHandouts(courseId: string): Promise<CourseHandouts> {
  const { data } = await getAuthenticatedHttpClient().get<CourseHandouts>(getCourseHandoutApiUrl(courseId));
  return data;
}

export async function editHandouts(courseId: string, courseHandouts: CourseHandouts): Promise<CourseHandouts> {
  const { data } = await getAuthenticatedHttpClient().put<CourseHandouts>(
    getCourseHandoutApiUrl(courseId),
    courseHandouts,
  );
  return data;
}
