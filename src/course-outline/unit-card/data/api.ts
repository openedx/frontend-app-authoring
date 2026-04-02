import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

// Shape of a single component inside a unit
export interface UnitComponent {
  blockId: string;
  blockType: string;
  displayName: string;
}

// Shape of one entry in the component_templates array returned by the API
export interface ComponentTemplate {
  type: string;
  displayName: string;
  beta?: boolean;
  templates: Array<{
    boilerplateName?: string;
    category?: string;
    displayName: string;
    supportLevel?: string | boolean;
  }>;
  supportLegend: {
    allowUnsupportedXblocks?: boolean;
    documentationLabel?: string;
    showLegend?: boolean;
  };
}

// Full response from the unit_handler endpoint
export interface UnitHandlerData {
  unitId: string;
  displayName: string;
  components: UnitComponent[];
}

export const getUnitHandlerApiUrl = (unitId: string) => `${getStudioBaseUrl()}/api/contentstore/v1/unit_handler/${unitId}`;

/**
 * Get unit handler data (components list).
 * @param {string} unitId
 * @returns {Promise<UnitHandlerData>}
 */
export async function getUnitHandler(unitId: string): Promise<UnitHandlerData> {
  const { data } = await getAuthenticatedHttpClient().get(getUnitHandlerApiUrl(unitId));
  return camelCaseObject(data) as UnitHandlerData;
}

// Reuse the existing container_handler endpoint that already serves component_templates.
const getContainerHandlerApiUrl = (unitId: string) => `${getStudioBaseUrl()}/api/contentstore/v1/container_handler/${unitId}`;

/**
 * Fetch component templates for a unit by calling the existing container_handler API.
 * Templates are course-level (identical for all units in a course), so callers
 * should cache the result per courseId rather than per unit.
 * @param {string} unitId – any unit in the course
 * @returns {Promise<ComponentTemplate[]>}
 */
export async function getComponentTemplates(unitId: string): Promise<ComponentTemplate[]> {
  const { data } = await getAuthenticatedHttpClient().get(getContainerHandlerApiUrl(unitId));
  const camelData = camelCaseObject(data);
  return (camelData.componentTemplates ?? []) as ComponentTemplate[];
}
