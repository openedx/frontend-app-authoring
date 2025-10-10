import { useQuery } from '@tanstack/react-query';
import { getStudioHomeLibraries } from './api';

export const studioHomeQueryKeys = {
  all: ['studioHome'],
  /**
   * Base key for list of v1/legacy libraries
   */
  librariesV1: () => [...studioHomeQueryKeys.all, 'librariesV1'],
};

export const useLibrariesV1Data = (enabled: boolean = true) => (
  useQuery({
    queryKey: studioHomeQueryKeys.librariesV1(),
    queryFn: getStudioHomeLibraries,
    enabled,
  })
);
