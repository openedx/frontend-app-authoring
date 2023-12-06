import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Library API service');

function setupRequest() {
  return { client: getAuthenticatedHttpClient(), baseUrl: getConfig().STUDIO_BASE_URL };
}

/* eslint-disable-next-line import/prefer-default-export */
export async function fetchUsers(libraryId) {
  const { client, baseUrl } = setupRequest();
  const response = await client.get(
    `${baseUrl}/api/libraries/v2/${libraryId}/team/`,
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    apiError.message = null;
    apiError.fields = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });
  return response.data;
}

export async function addUserToLibrary({ libraryId, data }) {
  const { client, baseUrl } = setupRequest();
  const response = await client.post(
    `${baseUrl}/api/libraries/v2/${libraryId}/team/`,
    data,
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    apiError.message = null;
    apiError.fields = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });
  return response.data;
}

export async function setUserAccessLevel({ libraryId, user, level }) {
  const { client, baseUrl } = setupRequest();
  const response = await client.put(
    `${baseUrl}/api/libraries/v2/${libraryId}/team/user/${user.username}/`,
    { access_level: level },
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    apiError.message = null;
    apiError.fields = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });
  return response.data;
}

export async function removeUserFromLibrary({ libraryId, user }) {
  const { client, baseUrl } = setupRequest();
  return client.delete(
    `${baseUrl}/api/libraries/v2/${libraryId}/team/user/${user.username}/`,
  ).catch((error) => {
    /* Normalize error data. */
    const apiError = Object.create(error);
    apiError.message = null;
    apiError.fields = JSON.parse(error.customAttributes.httpErrorResponseData);
    throw apiError;
  });
}
