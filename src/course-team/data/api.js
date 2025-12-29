import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { USER_ROLES } from '../../constants';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseTeamApiUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/course_team/${courseId}`;
export const getCourseUserRoleApiUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/course_user_role/${courseId}`;
export const getCourseRunApiUrl = (courseId) => `${getApiBaseUrl()}/api/v1/course_runs/${courseId}/`;
export const updateCourseTeamUserApiUrl = (courseId, email) => `${getApiBaseUrl()}/course_team/${courseId}/${email}`;

/**
 * Get course team.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseTeam(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseTeamApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Get the current user's role for a course.
 * @param {string} courseId
 * @returns {Promise<{ role: ('instructor'|'staff'|null) }>}
 */
export async function getCourseUserRole(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseTeamApiUrl(courseId));

  const camelCaseData = camelCaseObject(data);
  const currentUser = getAuthenticatedUser();
  const currentUserEmail = currentUser?.email;
  const currentUsername = currentUser?.username;

  // Find the current user in the users array
  const currentUserInTeam = camelCaseData?.users?.find(
    (user) => user.email === currentUserEmail || user.username === currentUsername
  );

  // Return the role in the same format as before
  return {
    role: currentUserInTeam?.role || null,
  };
}

/**
 * Get the current user's role for a course using the course_runs API.
 * This uses the existing /api/v1/course_runs/{course_id}/ endpoint.
 * @param {string} courseId
 * @returns {Promise<{ role: ('instructor'|'staff'|null) }>}
 */
export async function getCourseUserRoleFromCourseRuns(courseId) {
  try {
    const { data } = await getAuthenticatedHttpClient()
      .get(getCourseRunApiUrl(courseId));

    const camelCaseData = camelCaseObject(data);
    const currentUser = getAuthenticatedUser();
    const currentUserEmail = currentUser?.email;
    const currentUsername = currentUser?.username;

    // The course_runs API returns a 'team' array with user roles
    const currentUserInTeam = camelCaseData?.team?.find(
      (member) => member.user === currentUsername
    );

    // Return the role in the same format as getCourseUserRole
    return {
      role: currentUserInTeam?.role || null,
    };
  } catch (error) {
    // If there's an error (e.g., 404, 403), return null role
    console.error('Error fetching user role from course_runs API:', error);
    return {
      role: null,
    };
  }
}

/**
 * Create course team user.
 * @param {string} courseId
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function createTeamUser(courseId, email) {
  await getAuthenticatedHttpClient()
    .post(updateCourseTeamUserApiUrl(courseId, email), { role: USER_ROLES.staff });
}

/**
 * Change role course team user.
 * @param {string} courseId
 * @param {string} email
 * @param {string} role
 * @returns {Promise<Object>}
 */
export async function changeRoleTeamUser(courseId, email, role) {
  await getAuthenticatedHttpClient()
    .put(updateCourseTeamUserApiUrl(courseId, email), { role });
}

/**
 * Delete course team user.
 * @param {string} courseId
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function deleteTeamUser(courseId, email) {
  await getAuthenticatedHttpClient()
    .delete(updateCourseTeamUserApiUrl(courseId, email));
}
