import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { studioHomeQueryKeys } from '@src/studio-home/data/apiHooks';
import { createLibraryV1 } from './api';

/**
 * Hook that provides a "mutation" that can be used to create a new content library.
 */
export const useCreateLibraryV1 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLibraryV1,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: studioHomeQueryKeys.librariesV1() });
    },
  });
};
