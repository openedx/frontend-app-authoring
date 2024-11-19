import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getHelpUrlsApiUrl = () => `${getConfig().STUDIO_BASE_URL}/api/contentstore/v1/help_urls`;

export async function getHelpUrls() {
  const { data } = await getAuthenticatedHttpClient()
    .get(getHelpUrlsApiUrl());
  return camelCaseObject(data);
}
