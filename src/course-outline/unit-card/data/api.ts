import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export interface UnitComponent {
  blockId: string;
  blockType: string;
  displayName: string;
}

export interface UnitHandlerData {
  unitId: string;
  displayName: string;
  components: UnitComponent[];
}

export const getUnitHandlerApiUrl = (unitId: string) => `${getStudioBaseUrl()}/api/contentstore/v1/unit_handler/${unitId}`;

/**
 * Get unit handler data.
 * @param {string} unitId
 * @returns {Promise<UnitHandlerData>}
 */
export async function getUnitHandler(unitId: string): Promise<UnitHandlerData> {
  const { data } = await getAuthenticatedHttpClient().get(getUnitHandlerApiUrl(unitId));
  return camelCaseObject(data) as UnitHandlerData;
}
