// @ts-check
/**
 * This is a file used especially in this `taxonomy` module.
 *
 * We are using a new approach, using `useQuery` to build and execute the queries to the APIs.
 * This approach accelerates the development.
 *
 * In this file you will find two types of hooks:
 * - Hooks that builds the query with `useQuery`. These hooks are not used outside of this file.
 *   Ex. useTaxonomyListData.
 * - Hooks that calls the query hook, prepare and return the data.
 *   Ex. useTaxonomyListDataResponse & useIsTaxonomyListDataLoaded.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaxonomyListData, deleteTaxonomy, getTaxonomy } from './api';

/**
 * Builds the query to get the taxonomy list
 * @param {string} org Optional organization query param
 */
const useTaxonomyListData = (org) => (
  useQuery({
    queryKey: ['taxonomyList', org],
    queryFn: () => getTaxonomyListData(org),
  })
);

/**
 * Builds the mutation to delete a taxonomy.
 * @returns An object with the mutation configuration.
 */
export const useDeleteTaxonomy = () => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    /** @type {import("@tanstack/react-query").MutateFunction<any, any, {pk: number}>} */
    mutationFn: async ({ pk }) => deleteTaxonomy(pk),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['taxonomyList'] });
    },
  });
  return mutate;
};

/** Builds the query to get the taxonomy detail
  * @param {number} taxonomyId
  */
const useTaxonomyDetailData = (taxonomyId) => (
  useQuery({
    queryKey: ['taxonomyDetail', taxonomyId],
    queryFn: async () => getTaxonomy(taxonomyId),
  })
);

/**
 * Gets the taxonomy list data
 * @param {string} org Optional organization query param
 * @returns {import("./types.mjs").TaxonomyListData | undefined}
 */
export const useTaxonomyListDataResponse = (org) => {
  const response = useTaxonomyListData(org);
  if (response.status === 'success') {
    return { ...response.data, refetch: response.refetch };
  }
  return undefined;
};

/**
 * Returns the status of the taxonomy list query
 * @param {string} org Optional organization param
 * @returns {boolean}
 */
export const useIsTaxonomyListDataLoaded = (org) => (
  useTaxonomyListData(org).status === 'success'
);

/**
 * @param {number} taxonomyId
 * @returns {Pick<import('@tanstack/react-query').UseQueryResult, "error" | "isError" | "isFetched" | "isSuccess">}
 */
export const useTaxonomyDetailDataStatus = (taxonomyId) => {
  const {
    isError,
    error,
    isFetched,
    isSuccess,
  } = useTaxonomyDetailData(taxonomyId);
  return {
    isError,
    error,
    isFetched,
    isSuccess,
  };
};

/**
 * @param {number} taxonomyId
 * @returns {import("./types.mjs").TaxonomyData | undefined}
 */
export const useTaxonomyDetailDataResponse = (taxonomyId) => {
  const { isSuccess, data } = useTaxonomyDetailData(taxonomyId);
  if (isSuccess) {
    return data;
  }

  return undefined;
};
