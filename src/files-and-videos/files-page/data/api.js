import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import JSZip from 'jszip';
import saveAs from 'file-saver';

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
export async function getAssets(courseId, page) {
  const nextPage = page || 0;
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getAssetsUrl(courseId)}?page=${nextPage}`);
  return camelCaseObject(data);
}

/**
 * Fetches the course custom pages for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getAssetDetails({ courseId, filenames, fileCount }) {
  const params = new URLSearchParams(filenames.map(filename => ['display_name', filename]));
  params.append('page_size', fileCount);
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getAssetsUrl(courseId)}?${params}`);
  return camelCaseObject(data);
}

/**
 * Fetch asset file.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function getDownload(selectedRows, courseId) {
  const downloadErrors = [];
  if (selectedRows?.length > 1) {
    const zip = new JSZip();
    const date = new Date().toString();
    const folder = zip.folder(`${courseId}-assets-${date}`);
    const assetNames = [];
    const assetFetcher = await Promise.allSettled(
      selectedRows.map(async (row) => {
        const asset = row?.original;
        try {
          assetNames.push(asset.displayName);
          const res = await fetch(`${getApiBaseUrl()}/${asset.id}`);
          if (!res.ok) {
            throw new Error();
          }
          return await res.blob();
        } catch (error) {
          downloadErrors.push(`Failed to download ${asset?.displayName}.`);
          return null;
        }
      }),
    );
    const definedAssets = assetFetcher.filter(asset => asset.value !== null);
    if (definedAssets.length > 0) {
      definedAssets.forEach((assetBlob, index) => {
        folder.file(assetNames[index], assetBlob.value, { blob: true });
      });
      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, `${courseId}-assets-${date}.zip`);
      });
    }
  } else if (selectedRows?.length === 1) {
    const asset = selectedRows[0].original;
    try {
      saveAs(`${getApiBaseUrl()}/${asset.id}`, asset.displayName);
    } catch (error) {
      downloadErrors.push(`Failed to download ${asset?.displayName}.`);
    }
  } else {
    downloadErrors.push('No files were selected to download');
  }
  return downloadErrors;
}

/**
 * Fetch where asset is used in a course.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function getAssetUsagePaths({ courseId, assetId }) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getAssetsUrl(courseId)}${assetId}/usage`);
  const { usage_locations: usageLocations } = data;
  return { usageLocations };
}

/**
 * Delete asset to course.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function deleteAsset(courseId, assetId) {
  await getAuthenticatedHttpClient()
    .delete(`${getAssetsUrl(courseId)}${assetId}`);
}

/**
 * Add asset to course.
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
