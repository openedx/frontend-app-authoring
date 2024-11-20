import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { createLibraryV2 } from './api';
import { libraryAuthoringQueryKeys } from '../../data/apiHooks';

/**
 * Hook that provides a "mutation" that can be used to create a new content library.
 */
export const useCreateLibraryV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLibraryV2,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibraryList() });
    },
  });
};
