// @ts-check
import { useQuery } from '@tanstack/react-query';
import { getTaxonomyListData } from './data/api';

/**
 * Builds the query yo get the taxonomy list
 * @returns {import("./data/types.mjs").UseQueryResult}
 */
const useTaxonomyListData = () => (
  useQuery({
    queryKey: ['taxonomyList'],
    queryFn: getTaxonomyListData,
  })
);

/**
 * Gets the taxonomy list data
 * @returns {import("./data/types.mjs").TaxonomyListData | undefined}
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
