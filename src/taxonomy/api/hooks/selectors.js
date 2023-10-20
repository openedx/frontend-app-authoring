// @ts-check
import {
  useTaxonomyListData,
  exportTaxonomy,
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

export const callExportTaxonomy = (pk, format) => (
  exportTaxonomy(pk, format)
);
