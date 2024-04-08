// @ts-check
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getContentSearchConfigUrl = () => new URL(
  'api/content_search/v2/studio/',
  getConfig().STUDIO_BASE_URL,
).href;

/**
 * Get the content search configuration from the CMS.
 *
 * @returns {Promise<{url: string, indexName: string, apiKey: string}>}
 */
export const getContentSearchConfig = async () => {
  const url = getContentSearchConfigUrl();
  const response = await getAuthenticatedHttpClient().get(url);
  return {
    url: response.data.url,
    indexName: response.data.index_name,
    apiKey: response.data.api_key,
  };
};
