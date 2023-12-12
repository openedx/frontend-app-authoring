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
import { useQuery } from '@tanstack/react-query';
import { getTaxonomyListData } from './api';

/**
 * Builds the query to get the taxonomy list
 * @param {string} org Optional organization query param
 * @returns {import("./types.mjs").UseQueryResult}
 */
const useTaxonomyListData = (org) => (
  useQuery({
    queryKey: ['taxonomyList'],
    queryFn: () => getTaxonomyListData(org),
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
    return response.data;
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
