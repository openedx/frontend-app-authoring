import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { XBLOCK_VIEW_SYSTEM } from '../../common';

ensureConfig(['STUDIO_BASE_URL', 'LMS_BASE_URL'], 'library API service');

export async function getLibraryBlock(blockId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.get(`${baseUrl}/api/libraries/v2/blocks/${blockId}/`);

  return response.data;
}

export async function deleteLibraryBlock(blockId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.delete(`${baseUrl}/api/libraries/v2/blocks/${blockId}/`);

  return response.data;
}

export async function renderXBlockView(blockId, viewSystem, viewName) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = viewSystem === XBLOCK_VIEW_SYSTEM.Studio ? getConfig().STUDIO_BASE_URL : getConfig().LMS_BASE_URL;
  const response = await client.get(`${baseUrl}/api/xblock/v2/xblocks/${blockId}/view/${viewName}/`);

  return {
    content: response.data.content,
    resources: response.data.resources,
  };
}

/** Get the OLX source code of the given block */
export async function getLibraryBlockOlx(blockId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.get(`${baseUrl}/api/libraries/v2/blocks/${blockId}/olx/`);

  return response.data.olx;
}

/** Set the OLX source code of the given block */
export async function setLibraryBlockOlx(blockId, olx) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  await client.post(`${baseUrl}/api/libraries/v2/blocks/${blockId}/olx/`, { olx });
}

/** Get the static asset files of the given block */
export async function getLibraryBlockAssets(blockId) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.get(`${baseUrl}/api/libraries/v2/blocks/${blockId}/assets/`);

  return response.data.files;
}

export async function addLibraryBlockAsset(blockId, fileName, fileData) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  const requestData = new FormData();
  requestData.set('content', fileData, fileName);

  return client.put(`${baseUrl}/api/libraries/v2/blocks/${blockId}/assets/${fileName}`, requestData, {
    headers: {/* Clear the Content-Type header so FormData can set it correctly */},
  });
}

export async function deleteLibraryBlockAsset(blockId, fileName) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  return client.delete(`${baseUrl}/api/libraries/v2/blocks/${blockId}/assets/${fileName}`);
}
