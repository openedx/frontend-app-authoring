import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { TaxonomyData, TaxonomyListData } from './types';



const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomiesV1Endpoint = () => new URL('api/content_tagging/v1/taxonomies/', getApiBaseUrl()).href;
/**
 * Helper method for creating URLs for the tagging/taxonomy API. Used only in this file.
 * @param path The subpath within the taxonomies "v1" REST API namespace
 * @param searchParams Query parameters to include
 */
const makeUrl = (path: string, searchParams?: Record<string, string | number>): string => {
  const url = new URL(path, getTaxonomiesV1Endpoint());
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.append(k, String(v)));
  }
  return url.href;
};

export const ALL_TAXONOMIES = '__all';
export const UNASSIGNED = '__unassigned';

export const apiUrls = {
  /**
   * Get the URL of the "list all taxonomies" endpoint
   * @param org Optionally, Filter the list to only show taxonomies assigned to this org
   */
  taxonomyList(org?: string) {
    const params: Record<string, string> = {};
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
   * @param taxonomyId The ID of the taxonomy
   * @param format Which format to use for the export
   */
  exportTaxonomy: (taxonomyId: number, format: 'json' | 'csv') => (
    makeUrl(`${taxonomyId}/export/`, { output_format: format, download: 1 })
  ),
  /**
   * The the URL of the downloadable template file that shows how to format a
   * taxonomy file.
   * @param format The format requested
   */
  taxonomyTemplate: (format: 'json' | 'csv') => makeUrl(`import/template.${format}`),
  /** Get the URL for a Taxonomy */
  taxonomy: (taxonomyId: number) => makeUrl(`${taxonomyId}/`),
  /**
   * Get the URL for listing the tags of a taxonomy
   * @param pageIndex Zero-indexed page number
   * @param pageSize How many tags per page to load
   */
  tagList: (taxonomyId: number, pageIndex: number, pageSize: number) => makeUrl(`${taxonomyId}/tags/`, {
    page: (pageIndex + 1), page_size: pageSize,
  }),
  /**
   * Get _all_ tags below a given parent tag. This may be replaced with something more scalable in the future.
   */
  allSubtagsOf: (taxonomyId: number, parentTagValue: string) => makeUrl(`${taxonomyId}/tags/`, {
    // Load as deeply as we can
    full_depth_threshold: 10000,
    parent_tag: parentTagValue,
  }),
  /** URL to create a new taxonomy from an import file. */
  createTaxonomyFromImport: () => makeUrl('import/'),
  /** URL to import tags into an existing taxonomy */
  tagsImport: (taxonomyId) => makeUrl(`${taxonomyId}/tags/import/`),
  /** URL to plan (preview what would happen) a taxonomy import */
  tagsPlanImport: (taxonomyId: number) => makeUrl(`${taxonomyId}/tags/import/plan/`),
  createTag: (taxonomyId: number) => makeUrl(`${taxonomyId}/tags/`),
} satisfies Record<string, (...args: any[]) => string>;

/**
 * Get list of taxonomies.
 * @param org Optionally, filter the list to only show taxonomies assigned to this org
 */
export async function getTaxonomyListData(org?: string): Promise<TaxonomyListData> {
  const { data } = await getAuthenticatedHttpClient().get(apiUrls.taxonomyList(org));
  return camelCaseObject(data);
}

/**
 * Delete a Taxonomy
 */
export async function deleteTaxonomy(taxonomyId: number): Promise<void> {
  await getAuthenticatedHttpClient().delete(apiUrls.taxonomy(taxonomyId));
}

/**
 * Get metadata about a Taxonomy
 * @param taxonomyId The ID of the taxonomy to get
 */
export async function getTaxonomy(taxonomyId: number): Promise<TaxonomyData> {
  const { data } = await getAuthenticatedHttpClient().get(apiUrls.taxonomy(taxonomyId));
  return camelCaseObject(data);
}

/**
 * Downloads the file of the exported taxonomy
 * @param taxonomyId The ID of the taxonomy
 * @param format Which format to use for the export file.
 */
export function getTaxonomyExportFile(taxonomyId: number, format: 'json' | 'csv'): void {
  window.location.href = apiUrls.exportTaxonomy(taxonomyId, format);
}
