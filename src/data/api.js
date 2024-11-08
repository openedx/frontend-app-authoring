import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getApiWaffleFlagsUrl = (courseId) => {
  const baseUrl = getStudioBaseUrl();
  const apiPath = '/api/contentstore/v1/course_waffle_flags';

  return courseId ? `${baseUrl}${apiPath}/${courseId}` : `${baseUrl}${apiPath}`;
};

function normalizeCourseDetail(data) {
  return {
    id: data.course_id,
    ...camelCaseObject(data),
  };
}

export async function getCourseDetail(courseId, username) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}?username=${username}`);

  return normalizeCourseDetail(data);
}

export async function getWaffleFlags(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getApiWaffleFlagsUrl(courseId));

  return normalizeCourseDetail(data);
}
