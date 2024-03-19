// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomiesV1Endpoint = () => new URL('api/content_tagging/v1/taxonomies/', getApiBaseUrl()).href;
/**
 * Helper method for creating URLs for the tagging/taxonomy API. Used only in this file.
 * @param {string} path The subpath within the taxonomies "v1" REST API namespace
 * @param {Record<string, string | number>} [searchParams] Query parameters to include
 */
const makeUrl = (path, searchParams) => {
  const url = new URL(path, getTaxonomiesV1Endpoint());
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.append(k, String(v)));
  }
  return url.href;
};

export const ALL_TAXONOMIES = '__all';
export const UNASSIGNED = '__unassigned';

/** @satisfies {Record<string, (...args: any[]) => string>} */
export const apiUrls = {
  /**
   * Get the URL of the "list all taxonomies" endpoint
   * @param {string} [org] Optionally, Filter the list to only show taxonomies assigned to this org
   */
  taxonomyList(org) {
    const params = {};
    if (org !== undefined) {
      if (org === UNASSIGNED) {
        params.unassigned = 'true';
      } else if (org !== ALL_TAXONOMIES) {
        params.org = org;
      }
    }
    return makeUrl('.', { enabled: 'true', ...params });
  },
  /**
   * Get the URL of the API endpoint to download a taxonomy as a CSV/JSON file.
   * @param {number} taxonomyId The ID of the taxonomy
   * @param {'json'|'csv'} format Which format to use for the export
   */
  exportTaxonomy: (taxonomyId, format) => makeUrl(`${taxonomyId}/export/`, { output_format: format, download: 1 }),
  /**
   * The the URL of the downloadable template file that shows how to format a
   * taxonomy file.
   * @param {'json'|'csv'} format The format requested
   */
  taxonomyTemplate: (format) => makeUrl(`import/template.${format}`),
  /**
   * Get the URL for a Taxonomy
   * @param {number} taxonomyId The ID of the taxonomy
   */
  taxonomy: (taxonomyId) => makeUrl(`${taxonomyId}/`),
  /**
   * Get the URL for listing the tags of a taxonomy
   * @param {number} taxonomyId
   * @param {number} pageIndex Zero-indexed page number
   * @param {*} pageSize How many tags per page to load
   */
  tagList: (taxonomyId, pageIndex, pageSize) => makeUrl(`${taxonomyId}/tags/`, {
    page: (pageIndex + 1), page_size: pageSize,
  }),
  /**
   * Get _all_ tags below a given parent tag. This may be replaced with something more scalable in the future.
   * @param {number} taxonomyId
   * @param {string} parentTagValue
   */
  allSubtagsOf: (taxonomyId, parentTagValue) => makeUrl(`${taxonomyId}/tags/`, {
    // Load as deeply as we can
    full_depth_threshold: 10000,
    parent_tag: parentTagValue,
  }),
  /** URL to create a new taxonomy from an import file. */
  createTaxonomyFromImport: () => makeUrl('import/'),
  /**
   * @param {number} taxonomyId
   */
  tagsImport: (taxonomyId) => makeUrl(`${taxonomyId}/tags/import/`),
  /**
   * @param {number} taxonomyId
   */
  tagsPlanImport: (taxonomyId) => makeUrl(`${taxonomyId}/tags/import/plan/`),
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
