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
 * Builds the query yo get the taxonomy list
 * @returns {import("./types.mjs").UseQueryResult}
 */
const useTaxonomyListData = () => (
  useQuery({
    queryKey: ['taxonomyList'],
    queryFn: getTaxonomyListData,
  })
);

/**
 * Gets the taxonomy list data
 * @returns {import("./types.mjs").TaxonomyListData | undefined}
 */
export const useTaxonomyListDataResponse = () => {
  const response = useTaxonomyListData();
  if (response.status === 'success') {
    return response.data;
  }
  return undefined;
};

/**
 * Returns the status of the taxonomy list query
 * @returns {boolean}
 */
export const useIsTaxonomyListDataLoaded = () => (
  useTaxonomyListData().status === 'success'
);
