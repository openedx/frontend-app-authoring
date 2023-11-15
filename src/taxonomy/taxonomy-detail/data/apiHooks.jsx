// @ts-check
import {
  useTaxonomyDetailData,
} from './api';

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
