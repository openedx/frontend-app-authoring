// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomiesV1Endpoint = () => new URL('api/content_tagging/v1/taxonomies/', getApiBaseUrl()).href;
/**
 * @param {string} path The subpath within the taxonomies "v1" REST API namespace
 */
const makeUrl = (path) => new URL(path, getTaxonomiesV1Endpoint());

export const ALL_TAXONOMIES = '__all';
export const UNASSIGNED = '__unassigned';

/** @satisfies {Record<string, (...args: any[]) => string>} */
export const apiUrls = {
  /**
   * Get the URL of the "list all taxonomies" endpoint
   * @param {string} [org] Optionally, Filter the list to only show taxonomies assigned to this org
   */
  taxonomyList(org) {
    const url = new URL(getTaxonomiesV1Endpoint());
    url.searchParams.append('enabled', 'true');
    if (org !== undefined) {
      if (org === UNASSIGNED) {
        url.searchParams.append('unassigned', 'true');
      } else if (org !== ALL_TAXONOMIES) {
        url.searchParams.append('org', org);
      }
    }
    return url.href;
  },
  /**
   * Get the URL of the API endpoint to download a taxonomy as a CSV/JSON file.
   * @param {number} taxonomyId The ID of the taxonomy
   * @param {'json'|'csv'} format Which format to use for the export
   */
  exportTaxonomy(taxonomyId, format) {
    const url = makeUrl(`${taxonomyId}/export/`);
    url.searchParams.set('output_format', format);
    url.searchParams.set('download', '1');
    return url.href;
  },
  /**
   * The the URL of the downloadable template file that shows how to format a
   * taxonomy file.
   * @param {'json'|'csv'} format The format requested
   */
  taxonomyTemplate: (format) => makeUrl(`import/template.${format}`).href,
  /**
   * Get the URL for a Taxonomy
   * @param {number} taxonomyId The ID of the taxonomy
   */
  taxonomy: (taxonomyId) => makeUrl(`${taxonomyId}/`).href,
  /** URL to create a new taxonomy from an import file. */
  createTaxonomyFromImport: () => makeUrl('import/').href,
  /**
   * @param {number} taxonomyId
   */
  tagsImport: (taxonomyId) => makeUrl(`${taxonomyId}/tags/import/`).href,
  /**
   * @param {number} taxonomyId
   */
  tagsPlanImport: (taxonomyId) => makeUrl(`${taxonomyId}/tags/import/plan/`).href,
};

/**
 * Get list of taxonomies.
 * @param {string} [org] Filter the list to only show taxonomies assigned to this org
 * @returns {Promise<import("./types.mjs").TaxonomyListData>}
 */
export async function getTaxonomyListData(org) {
  const { data } = await getAuthenticatedHttpClient().get(apiUrls.taxonomyList(org));
  return camelCaseObject(data);
}

/**
 * Delete a Taxonomy
 * @param {number} taxonomyId
 * @returns {Promise<void>}
 */
export async function deleteTaxonomy(taxonomyId) {
  await getAuthenticatedHttpClient().delete(apiUrls.taxonomy(taxonomyId));
}

/**
 * Get metadata about a Taxonomy
 * @param {number} taxonomyId The ID of the taxonomy to get
 * @returns {Promise<import("./types.mjs").TaxonomyData>}
 */
export async function getTaxonomy(taxonomyId) {
  const { data } = await getAuthenticatedHttpClient().get(apiUrls.taxonomy(taxonomyId));
  return camelCaseObject(data);
}

/**
 * Downloads the file of the exported taxonomy
 * @param {number} taxonomyId The ID of the taxonomy
 * @param {'json'|'csv'} format Which format to use for the export file.
 * @returns {void}
 */
export function getTaxonomyExportFile(taxonomyId, format) {
  window.location.href = apiUrls.exportTaxonomy(taxonomyId, format);
}
