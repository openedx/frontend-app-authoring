// @ts-check
import {
  useTagListData,
} from './api';

/* eslint-disable max-len */
/**
 * @param {number} taxonomyId
 * @param {import("./types.mjs").QueryOptions} options
 * @returns {Pick<import('@tanstack/react-query').UseQueryResult, "error" | "isError" | "isFetched" | "isLoading" | "isSuccess" >}
 */ /* eslint-enable max-len */
export const useTagListDataStatus = (taxonomyId, options) => {
  const {
    error,
    isError,
    isFetched,
    isLoading,
    isSuccess,
  } = useTagListData(taxonomyId, options);
  return {
    error,
    isError,
    isFetched,
    isLoading,
    isSuccess,
  };
};

// ToDo: fix types
/**
 * @param {number} taxonomyId
 * @param {import("./types.mjs").QueryOptions} options
 * @returns {import("./types.mjs").TagListData | undefined}
 */
export const useTagListDataResponse = (taxonomyId, options) => {
  const { isSuccess, data } = useTagListData(taxonomyId, options);
  if (isSuccess) {
    return data;
  }

  return undefined;
};
