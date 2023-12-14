// @ts-check
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTaxonomyTagsData,
  getContentTaxonomyTagsData,
  getContentData,
  updateContentTaxonomyTags,
} from './api';

/**
 * Builds the query to get the taxonomy tags
 * @param {number} taxonomyId The id of the taxonomy to fetch tags for
 * @param {string} fullPathProvided Optional param that contains the full URL to fetch data
 *                 If provided, we use it instead of generating the URL. This is usually for fetching subTags
 * @returns {import("@tanstack/react-query").UseQueryResult<import("./types.mjs").TaxonomyTagsData>}
 */
export const useTaxonomyTagsData = (taxonomyId, fullPathProvided) => (
  useQuery({
    queryKey: [`taxonomyTags${ fullPathProvided || taxonomyId }`],
    queryFn: () => getTaxonomyTagsData(taxonomyId, fullPathProvided),
  })
);

/**
 * Builds the query to get the taxonomy tags applied to the content object
 * @param {string} contentId The id of the content object to fetch the applied tags for
 * @returns {import("@tanstack/react-query").UseQueryResult<import("./types.mjs").ContentTaxonomyTagsData>}
 */
export const useContentTaxonomyTagsData = (contentId) => (
  useQuery({
    queryKey: ['contentTaxonomyTags', contentId],
    queryFn: () => getContentTaxonomyTagsData(contentId),
  })
);

/**
 * Builds the query to get meta data about the content object
 * @param {string} contentId The id of the content object (unit/component)
 * @returns {import("@tanstack/react-query").UseQueryResult<import("./types.mjs").ContentData>}
 */
export const useContentData = (contentId) => (
  useQuery({
    queryKey: ['contentData', contentId],
    queryFn: () => getContentData(contentId),
  })
);

/**
 * Builds the mutation to update the tags applied to the content object
 * @param {string} contentId The id of the content object to update tags for
 * @param {number} taxonomyId The id of the taxonomy the tags belong to
 */
export const useContentTaxonomyTagsUpdater = (contentId, taxonomyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * @type {import("@tanstack/react-query").MutateFunction<
     *   any,
     *   any,
     *   {
     *     tags: string[]
     *   }
     * >}
     */
    mutationFn: ({ tags }) => updateContentTaxonomyTags(contentId, taxonomyId, tags),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTaxonomyTags', contentId] });
    },
  });
};
