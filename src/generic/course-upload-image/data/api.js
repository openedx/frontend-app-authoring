import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getUploadAssetsUrl = (courseId) => new URL(
  `/assets/${courseId}/`,
  getConfig().STUDIO_BASE_URL,
);

/**
 * Upload assets.
 * @param {string} courseId
 * @param {binary} formData
 * @returns {Promise<Object>}
 */
export async function uploadAssets(courseId, fileData) {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getUploadAssetsUrl(courseId).href}`,
    fileData,
  );
  return camelCaseObject(data);
}
