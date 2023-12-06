import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { XBLOCK_VIEW_SYSTEM } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const getXBlockHandlerUrl = async (blockId, viewSystem, handlerName) => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = viewSystem === XBLOCK_VIEW_SYSTEM.Studio ? getConfig().STUDIO_BASE_URL : getConfig().LMS_BASE_URL;
  const response = await client.get(`${baseUrl}/api/xblock/v2/xblocks/${blockId}/handler_url/${handlerName}/`);

  return response.data.handler_url;
};

export const getOrganizations = async () => {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;

  const response = await client.get(`${baseUrl}/organizations`);
  return response.data;
};
