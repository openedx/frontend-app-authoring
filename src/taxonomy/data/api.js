// @ts-check
import { getConfig } from '@edx/frontend-platform';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getTaxonomyTemplateApiUrl = (format) => new URL(
  `api/content_tagging/v1/taxonomies/import/template.${format}`,
  getApiBaseUrl(),
).href;

/**
 * Downloads the template file for import taxonomies
 * @param {('json'|'csv')} format
 * @returns {void}
 */
export function getTaxonomyTemplateFile(format) { // eslint-disable-line import/prefer-default-export
  window.location.href = getTaxonomyTemplateApiUrl(format);
}
