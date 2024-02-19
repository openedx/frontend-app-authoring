// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  normalizeLearningSequencesData,
  normalizeMetadata,
  normalizeCourseHomeCourseMetadata,
  appendBrowserTimezoneToUrl,
  normalizeCourseSectionVerticalData,
} from './utils';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getLmsBaseUrl = () => getConfig().LMS_BASE_URL;

export const getCourseUnitApiUrl = (itemId) => `${getStudioBaseUrl()}/xblock/container/${itemId}`;
export const getXBlockBaseApiUrl = (itemId) => `${getStudioBaseUrl()}/xblock/${itemId}`;
export const getCourseSectionVerticalApiUrl = (itemId) => `${getStudioBaseUrl()}/api/contentstore/v1/container_handler/${itemId}`;
export const getLearningSequencesOutlineApiUrl = (courseId) => `${getLmsBaseUrl()}/api/learning_sequences/v1/course_outline/${courseId}`;
export const getCourseMetadataApiUrl = (courseId) => `${getLmsBaseUrl()}/api/courseware/course/${courseId}`;
export const getCourseHomeCourseMetadataApiUrl = (courseId) => `${getLmsBaseUrl()}/api/course_home/course_metadata/${courseId}`;

export const postXBlockBaseApiUrl = () => `${getStudioBaseUrl()}/xblock/`;

/**
 * Get course unit.
 * @param {string} unitId
 * @returns {Promise<Object>}
 */
export async function getCourseUnitData(unitId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseUnitApiUrl(unitId));

  return camelCaseObject(data);
}

/**
 * Edit course unit display name.
 * @param {string} unitId
 * @param {string} displayName
 * @returns {Promise<Object>}
 */
export async function editUnitDisplayName(unitId, displayName) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getXBlockBaseApiUrl(unitId), {
      metadata: {
        display_name: displayName,
      },
    });

  return data;
}

/**
 * Get an object containing course section vertical data.
 * @param {string} unitId
 * @returns {Promise<Object>}
 */
export async function getCourseSectionVerticalData(unitId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseSectionVerticalApiUrl(unitId));

  return normalizeCourseSectionVerticalData(data);
}

/**
 * Retrieves the outline of learning sequences for a specific course.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<Object>} A Promise that resolves to the normalized learning sequences outline data.
 */
export async function getLearningSequencesOutline(courseId) {
  const { href } = new URL(getLearningSequencesOutlineApiUrl(courseId));
  const { data } = await getAuthenticatedHttpClient().get(href, {});

  return normalizeLearningSequencesData(data);
}

/**
 * Retrieves metadata for a specific course.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<Object>} A Promise that resolves to the normalized course metadata.
 */
export async function getCourseMetadata(courseId) {
  let courseMetadataApiUrl = getCourseMetadataApiUrl(courseId);
  courseMetadataApiUrl = appendBrowserTimezoneToUrl(courseMetadataApiUrl);
  const metadata = await getAuthenticatedHttpClient().get(courseMetadataApiUrl);

  return normalizeMetadata(metadata);
}

/**
 * Retrieves metadata for a course's home page.
 * @param {string} courseId - The ID of the course.
 * @param {string} rootSlug - The root slug for the course.
 * @returns {Promise<Object>} A Promise that resolves to the normalized course home page metadata.
 */
export async function getCourseHomeCourseMetadata(courseId, rootSlug) {
  let courseHomeCourseMetadataApiUrl = getCourseHomeCourseMetadataApiUrl(courseId);
  courseHomeCourseMetadataApiUrl = appendBrowserTimezoneToUrl(courseHomeCourseMetadataApiUrl);
  const { data } = await getAuthenticatedHttpClient().get(courseHomeCourseMetadataApiUrl);

  return normalizeCourseHomeCourseMetadata(data, rootSlug);
}

/**
 * Creates a new course XBlock.
 * @param {Object} options - The options for creating the XBlock.
 * @param {string} options.type - The type of the XBlock.
 * @param {string} [options.category] - The category of the XBlock. Defaults to the type if not provided.
 * @param {string} options.parentLocator - The parent locator of the XBlock.
 * @param {string} [options.displayName] - The display name for the XBlock.
 * @param {string} [options.boilerplate] - The boilerplate for the XBlock.
 * @returns {Promise<Object>} A Promise that resolves to the created XBlock data.
 */
export async function createCourseXblock({
  type, category, parentLocator, displayName, boilerplate,
}) {
  const body = {
    type,
    boilerplate,
    category: category || type,
    parent_locator: parentLocator,
    display_name: displayName,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(postXBlockBaseApiUrl(), body);

  return data;
}
