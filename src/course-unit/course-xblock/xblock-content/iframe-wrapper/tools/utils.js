import { COMPONENT_TYPES } from '../../../../constants';

/**
 * Normalizes an array of resources by mapping each entry to an object with specified properties.
 *
 * @param {Array<[string, any]>} resourcesArray - Array of resource tuples consisting of an id and an object.
 * @returns {Array<{ id: string, ...any }>} - Array of normalized resources with specified properties.
 */
export const normalizeResources = (resourcesArray) => resourcesArray.map(([id, obj]) => ({ id, ...obj }));

/**
 * Filters and extracts resources from an array based on specified criteria.
 *
 * @param {Array<{ kind: string, mimetype: string, data: any }>} resources - Array of resources.
 * @param {string} kind - Kind of resource to filter.
 * @param {string} mimetype - Mimetype of resource to filter.
 * @returns {Array<any>} - Filtered and extracted resources.
 */
export const filterAndExtractResources = (resources, kind, mimetype) => resources
  .filter(r => r.kind === kind && r.mimetype === mimetype).map(r => r.data);

/**
 * Generates HTML tags for resources based on their URLs, base URL, and type.
 *
 * @param {Array<string>} urls - Array of resource URLs.
 * @param {string} baseUrl - Base URL to prepend to relative URLs.
 * @param {string} type - Type of resource.
 * @returns {string} - Generated HTML tags for resources.
 */
export const generateResourceTags = (urls, baseUrl, type) => urls.map(url => {
  const fullUrl = type === COMPONENT_TYPES.openassessment ? url : baseUrl + url;
  if (url.endsWith('.css')) {
    return `<link rel="stylesheet" href="${fullUrl}">`;
  } if (url.endsWith('.js')) {
    return `<script src="${fullUrl}"></script>`;
  }
  return '';
}).join('\n');

/**
 * Modifies void hrefs in HTML to prevent default behavior.
 *
 * @param {string} html - HTML content to modify.
 * @returns {string} - Modified HTML content with void hrefs modified to prevent default behavior.
 */
export const modifyVoidHrefToPreventDefault = (html) => html
  .replace(/href="javascript:void\(0\)"/g, 'href="javascript:void(0)" onclick="event.preventDefault()"');
