import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { USER_ROLES } from '@src/constants';
import { getAllPages } from '@src/generic/data/paginatedList';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseTeamApiUrl = (courseId: string) =>
  `${getApiBaseUrl()}/api/authoring/v2/courses/${courseId}/team_members/`;
export const getCourseTeamCallerApiUrl = (courseId: string) => `${getCourseTeamApiUrl(courseId)}me/`;
export const updateCourseTeamUserApiUrl = (courseId: string, email: string) =>
  `${getApiBaseUrl()}/course_team/${courseId}/${email}`;

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

/** The requesting user as the course team sees them, as the server sends it. */
interface CourseTeamCallerResponse {
  username: string;
  email: string;
  role: string | null;
  can_manage_team: boolean;
  is_only_instructor: boolean;
}

/**
 * Get course team.
 *
 * The members and the requesting user's permissions on the team are served
 * separately; both are needed to render the page.
 */
export async function getCourseTeam(courseId: string): Promise<CourseTeam> {
  const [users, { data: caller }] = await Promise.all([
    getAllPages<CourseTeamUser>(getCourseTeamApiUrl(courseId)),
    getAuthenticatedHttpClient().get<CourseTeamCallerResponse>(getCourseTeamCallerApiUrl(courseId)),
  ]);

  return {
    users: camelCaseObject(users),
    allowActions: caller.can_manage_team,
    showTransferOwnershipHint: caller.is_only_instructor,
  };
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
