// @ts-check
import {
  useTaxonomyListData,
  useExportTaxonomy,
} from './api';

/**
 * @returns {import("../types.mjs").TaxonomyListData | undefined}
 */
export const useTaxonomyListDataResponse = () => {
  const response = useTaxonomyListData();
  if (response.status === 'success') {
    return response.data.data;
  }
  return undefined;
};

/**
 * @returns {boolean}
 */
export const useIsTaxonomyListDataLoaded = () => (
  useTaxonomyListData().status === 'success'
);

export const useExportTaxonomyMutation = () => (
  useExportTaxonomy()
);
