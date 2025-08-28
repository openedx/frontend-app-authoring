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
    // WIP: temporarily change migrated status to test the new UI
    // select: (data) => ({
    //   libraries: data.libraries.map((lib) => ({ ...lib, isMigrated: true })),
    // }),
  })
);
