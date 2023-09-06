/* eslint-disable no-undef */
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseOutlineIndexApiUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/course_index/${courseId}`;
export const getCourseBestPracticesApiUrl = ({
  courseId,
  excludeGraded,
  all,
}) => `${getApiBaseUrl()}/api/courses/v1/quality/${courseId}/?exclude_graded=${excludeGraded}&all=${all}`;
export const getCourseLaunchApiUrl = ({
  courseId,
  gradedOnly,
  validateOras,
  all,
}) => `${getApiBaseUrl()}/api/courses/v1/validation/${courseId}/?graded_only=${gradedOnly}&validate_oras=${validateOras}&all=${all}`;
const getEnableHighlightsEmailsApiUrl = (courseId) => {
  const formattedCourseId = courseId.split('course-v1:')[1];
  return `${getApiBaseUrl()}/xblock/block-v1:${formattedCourseId}+type@course+block@course`;
};
export const getCourseReindexApiUrl = (reindexLink) => `${getApiBaseUrl()}${reindexLink}`;
export const getUpdateCourseSectionApiUrl = (sectionId) => `${getApiBaseUrl()}/xblock/${sectionId}`;
export const getCourseSectionApiUrl = (sectionId) => `${getApiBaseUrl()}/xblock/outline/${sectionId}`;
export const getCourseSectionDuplicateApiUrl = () => `${getApiBaseUrl()}/xblock/`;

/**
 * Get course outline index.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseOutlineIndex(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseOutlineIndexApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Get course best practices.
 * @param {string} courseId
 * @param {boolean} excludeGraded
 * @param {boolean} all
 * @returns {Promise<Object>}
 */
export async function getCourseBestPractices({
  courseId,
  excludeGraded,
  all,
}) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseBestPracticesApiUrl({ courseId, excludeGraded, all }));

  return camelCaseObject(data);
}

/**
 * Get course launch.
 * @param {string} courseId
 * @param {boolean} gradedOnly
 * @param {boolean} validateOras
 * @param {boolean} all
 * @returns {Promise<Object>}
 */
export async function getCourseLaunch({
  courseId,
  gradedOnly,
  validateOras,
  all,
}) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseLaunchApiUrl({
      courseId, gradedOnly, validateOras, all,
    }));

  return camelCaseObject(data);
}

/**
 * Enable course highlights emails
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function enableCourseHighlightsEmails(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getEnableHighlightsEmailsApiUrl(courseId), {
      publish: 'republish',
      metadata: {
        highlights_enabled_for_messaging: true,
      },
    });

  return data;
}

/**
 * Restart reindex course
 * @param {string} reindexLink
 * @returns {Promise<Object>}
 */
export async function restartIndexingOnCourse(reindexLink) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseReindexApiUrl(reindexLink));

  return camelCaseObject(data);
}

/**
 * Get course section
 * @param {string} sectionId
 * @returns {Promise<Object>}
 */
export async function getCourseSection(sectionId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseSectionApiUrl(sectionId));
  return camelCaseObject(data);
}

/**
 * Update course section highlights
 * @param {string} sectionId
 * @param {Array<string>} highlights
 * @returns {Promise<Object>}
 */
export async function updateCourseSectionHighlights(sectionId, highlights) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getUpdateCourseSectionApiUrl(sectionId), {
      publish: 'republish',
      metadata: {
        highlights,
      },
    });

  return data;
}

/**
 * Publish course section
 * @param {string} sectionId
 * @returns {Promise<Object>}
 */
export async function publishCourseSection(sectionId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getUpdateCourseSectionApiUrl(sectionId), {
      publish: 'make_public',
    });

  return data;
}

/**
 * Edit course section
 * @param {string} sectionId
 * @param {string} displayName
 * @returns {Promise<Object>}
 */
export async function editCourseSection(sectionId, displayName) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getUpdateCourseSectionApiUrl(sectionId), {
      metadata: {
        display_name: displayName,
      },
    });

  return data;
}

/**
 * Delete course section
 * @param {string} sectionId
 * @returns {Promise<Object>}
 */
export async function deleteCourseSection(sectionId) {
  const { data } = await getAuthenticatedHttpClient()
    .delete(getUpdateCourseSectionApiUrl(sectionId));

  return data;
}

/**
 * Duplicate course section
 * @param {string} sectionId
 * @param {string} courseBlockId
 * @returns {Promise<Object>}
 */
export async function duplicateCourseSection(sectionId, courseBlockId) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseSectionDuplicateApiUrl(), {
      duplicate_source_locator: sectionId,
      parent_locator: courseBlockId,
    });

  return data;
}
