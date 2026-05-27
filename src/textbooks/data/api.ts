import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { omit } from 'lodash';

const API_PATH_PATTERN = 'textbooks';
const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getTextbooksApiUrl = (courseId: string) =>
  `${getStudioBaseUrl()}/api/contentstore/v1/${API_PATH_PATTERN}/${courseId}`;
export const getUpdateTextbooksApiUrl = (courseId: string) => `${getStudioBaseUrl()}/${API_PATH_PATTERN}/${courseId}`;
export const getEditTextbooksApiUrl = (courseId: string, textbookId: string) =>
  `${getStudioBaseUrl()}/${API_PATH_PATTERN}/${courseId}/${textbookId}`;

export interface TextbookResponse {
  textbooks: Textbook[];
}

export interface BaseTextbook {
  chapters: {
    title: string;
    url: string;
  }[];
  tabTitle: string;
}

export interface Textbook extends BaseTextbook {
  id: string;
}

/**
 * Get textbooks for course.
 */
export async function getTextbooks(courseId: string): Promise<TextbookResponse> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getTextbooksApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Create new textbook for course.
 */
export async function createTextbook(courseId: string, textbook: BaseTextbook): Promise<Textbook> {
  const { data } = await getAuthenticatedHttpClient()
    .post(getUpdateTextbooksApiUrl(courseId), textbook);

  return camelCaseObject(data);
}

/**
 * Edit textbook for course.
 */
export async function editTextbook(courseId: string, textbook: Textbook): Promise<Textbook> {
  const { data } = await getAuthenticatedHttpClient()
    .put(getEditTextbooksApiUrl(courseId, textbook.id), omit(textbook, ['id']));

  return camelCaseObject(data);
}

/**
 * Delete textbook for course.
 */
export async function deleteTextbook(courseId: string, textbookId: string): Promise<void> {
  await getAuthenticatedHttpClient()
    .delete(getEditTextbooksApiUrl(courseId, textbookId));
}
