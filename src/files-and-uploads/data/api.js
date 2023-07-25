/* eslint-disable import/prefer-default-export */
import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getAssetsUrl = (courseId) => `${getApiBaseUrl()}/assets/${courseId}/`;

/**
 * Fetches the course custom pages for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getAssets(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getAssetsUrl(courseId));
  return camelCaseObject(data);
}

export async function getNextPageAssets(courseId, pageNumber) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getAssetsUrl(courseId)}?page=${pageNumber}&page_size=50`);
  return camelCaseObject(data);
}

/**
 * Delete custom page for provided block.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function deleteAsset(courseId, assetId) {
  await getAuthenticatedHttpClient()
    .delete(`${getAssetsUrl(courseId)}${assetId}`);
}

/**
 * Add custom page for provided block.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function addAsset(courseId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await getAuthenticatedHttpClient()
    .post(getAssetsUrl(courseId), formData);
  return camelCaseObject(data);
}

/**
 * Update locked attribute for provided asset.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function updateLockStatus({ assetId, courseId, locked }) {
  const { data } = await getAuthenticatedHttpClient()
    .put(`${getAssetsUrl(courseId)}${assetId}`, {
      locked,
    });
  return camelCaseObject(data);
}
