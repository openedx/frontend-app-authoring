import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { normalizeErrors } from '@src/library-authoring/common/helpers';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

/* eslint-disable-next-line import/prefer-default-export */
export async function updateLibrary({ libraryId, ...data }) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  return client.patch(
    `${baseUrl}/api/libraries/v2/${libraryId}/`,
    data,
  ).then((response) => response.data).catch((error) => normalizeErrors(error));
}
