// @ts-check
import { useQuery } from '@tanstack/react-query';
import { getTaxonomyTagsData, getContentTaxonomyTagsData, getContentData } from './api';

/**
 * Builds the query to get the taxonomy tags
 * @param {string} taxonomyId The id of the taxonomy to fetch tags for
 * @param {string} fullPathProvided Optional param that contains the full URL to fetch data
 *                 If provided, we use it instead of generating the URL. This is usually for fetching subTags
 * @returns {import("./types.mjs").UseQueryResult}
 */
const useTaxonomyTagsData = (taxonomyId, fullPathProvided) => (
  useQuery({
    queryKey: [`taxonomyTags${ fullPathProvided || taxonomyId }`],
    queryFn: () => getTaxonomyTagsData(taxonomyId, fullPathProvided),
  })
);

/**
 * Gets the taxonomy tags data
 * @param {string} taxonomyId The id of the taxonomy to fetch tags for
 * @param {string} fullPathProvided Optional param that contains the full URL to fetch data
 *                 If provided, we use it instead of generating the URL. This is usually for fetching subTags
 * @returns {import("./types.mjs").TaxonomyTagsData | undefined}
 */
export const useTaxonomyTagsDataResponse = (taxonomyId, fullPathProvided) => {
  const response = useTaxonomyTagsData(taxonomyId, fullPathProvided);
  if (response.status === 'success') {
    return response.data;
  }
  return undefined;
};

/**
 * Returns the status of the taxonomy tags query
 * @param {string} taxonomyId The id of the taxonomy to fetch tags for
 * @param {string} fullPathProvided Optional param that contains the full URL to fetch data
 *                 If provided, we use it instead of generating the URL. This is usually for fetching subTags
 * @returns {boolean}
 */
export const useIsTaxonomyTagsDataLoaded = (taxonomyId, fullPathProvided) => (
  useTaxonomyTagsData(taxonomyId, fullPathProvided).status === 'success'
);

/**
 * Builds the query to get the taxonomy tags applied to the content object
 * @param {string} contentId The id of the content object to fetch the applied tags for
 * @returns {import("./types.mjs").UseQueryResult}
 */
const useContentTaxonomyTagsData = (contentId) => (
  useQuery({
    queryKey: ['contentTaxonomyTags'],
    queryFn: () => getContentTaxonomyTagsData(contentId),
  })
);

/**
 * Gets the taxonomy tags applied to the content object
 * @param {string} contentId The id of the content object to fetch the applied tags for
 * @returns {import("./types.mjs").ContentTaxonomyTagsData | undefined}
 */
export const useContentTaxonomyTagsDataResponse = (contentId) => {
  const response = useContentTaxonomyTagsData(contentId);
  if (response.status === 'success') {
    return response.data;
  }
  return undefined;
};

/**
 * Gets the status of the content taxonomy tags query
 * @param {string} contentId The id of the content object to fetch the applied tags for
 * @returns {boolean}
 */
export const useIsContentTaxonomyTagsDataLoaded = (contentId) => (
  useContentTaxonomyTagsData(contentId).status === 'success'
);

/**
 * Builds the query to get meta data about the content object
 * @param {string} contentId The id of the content object (unit/component)
 * @returns {import("./types.mjs").UseQueryResult}
 */
const useContentData = (contentId) => (
  useQuery({
    queryKey: ['contentData'],
    queryFn: () => getContentData(contentId),
  })
);

/**
 * Gets the information about the content object
 * @param {string} contentId The id of the content object (unit/component)
 * @returns {import("./types.mjs").ContentData | undefined}
 */
export const useContentDataResponse = (contentId) => {
  const response = useContentData(contentId);
  if (response.status === 'success') {
    return response.data;
  }
  return undefined;
};

/**
 * Gets the status of the content data query
 * @param {string} contentId The id of the content object (unit/component)
 * @returns {boolean}
 */
export const useIsContentDataLoaded = (contentId) => (
  useContentData(contentId).status === 'success'
);
