import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { omit } from 'lodash';

const API_PATH_PATTERN = 'textbooks';
const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getTextbooksApiUrl = (courseId) => `${getStudioBaseUrl()}/api/contentstore/v1/${API_PATH_PATTERN}/${courseId}`;
export const getUpdateTextbooksApiUrl = (courseId) => `${getStudioBaseUrl()}/${API_PATH_PATTERN}/${courseId}`;
export const getEditTextbooksApiUrl = (courseId, textbookId) => `${getStudioBaseUrl()}/${API_PATH_PATTERN}/${courseId}/${textbookId}`;

/**
 * Get textbooks for course.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getTextbooks(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getTextbooksApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Create new textbook for course.
 * @param {string} courseId
 * @param {tab_title: string, chapters: Array<[title: string: url: string]>} textbook
 * @returns {Promise<Object>}
 */
export async function createTextbook(courseId, textbook) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getUpdateTextbooksApiUrl(courseId), textbook);

  return camelCaseObject(data);
}

/**
 * Edit textbook for course.
 * @param {string} courseId
 * @param {tab_title: string, id: string, chapters: Array<[title: string: url: string]>} textbook
 * @param {string} textbookId
 * @returns {Promise<Object>}
 */
export async function editTextbook(courseId, textbook) {
  const { data } = await getAuthenticatedHttpClient()
    .put(getEditTextbooksApiUrl(courseId, textbook.id), omit(textbook, ['id']));

  return camelCaseObject(data);
}

/**
 * Edit textbook for course.
 * @param {string} courseId
 * @param {string} textbookId
 * @returns {Promise<Object>}
 */
export async function deleteTextbook(courseId, textbookId) {
  const { data } = await getAuthenticatedHttpClient()
    .delete(getEditTextbooksApiUrl(courseId, textbookId));

  return camelCaseObject(data);
}
