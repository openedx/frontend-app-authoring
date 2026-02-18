import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { USER_ROLES } from '@src/constants';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseTeamApiUrl = (courseId: string) => `${getApiBaseUrl()}/api/contentstore/v1/course_team/${courseId}`;
export const updateCourseTeamUserApiUrl = (courseId: string, email: string) => `${getApiBaseUrl()}/course_team/${courseId}/${email}`;

export interface CourseTeamUser {
  id: number;
  email: string;
  role: string;
  username: string;
}

export interface CourseTeam {
  users: CourseTeamUser[];
  allowActions: boolean;
  showTransferOwnershipHint: boolean;
}

/**
 * Get course team.
 */
export async function getCourseTeam(courseId: string): Promise<CourseTeam> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseTeamApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Create course team user.
 */
export async function createTeamUser(courseId: string, email: string) {
  await getAuthenticatedHttpClient()
    .post(updateCourseTeamUserApiUrl(courseId, email), { role: USER_ROLES.staff });
}

/**
 * Change role course team user.
 */
export async function changeRoleTeamUser(courseId: string, email: string, role: string) {
  await getAuthenticatedHttpClient()
    .put(updateCourseTeamUserApiUrl(courseId, email), { role });
}

/**
 * Delete course team user.
 */
export async function deleteTeamUser(courseId: string, email: string) {
  await getAuthenticatedHttpClient()
    .delete(updateCourseTeamUserApiUrl(courseId, email));
}
