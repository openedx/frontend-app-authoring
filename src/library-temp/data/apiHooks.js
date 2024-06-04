// @ts-check
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

/** @typedef {import("../data/types.mjs").CreateBlockData} CreateBlockData */

export const libraryQueryKeys = {
  /**
   * Used in all query keys.
   * You can use these key to invalidate all queries.
   */
  all: ['libraries'],
};

/**
 * Use this mutation to create a block in a library
 */
export const useCreateLibraryBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /** @type {import("@tanstack/react-query").MutateFunction<any, any, CreateBlockData>} */
    mutationFn: async (data) => api.createLibraryBlock(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.all });
    },
  });
};
