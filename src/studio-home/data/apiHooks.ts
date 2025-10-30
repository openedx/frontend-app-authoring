import { useQuery } from '@tanstack/react-query';
import { getStudioHomeLibraries, getMigrationInfo } from './api';

export const studioHomeQueryKeys = {
  all: ['studioHome'],
  /**
   * Base key for list of v1/legacy libraries
   */
  librariesV1: () => [...studioHomeQueryKeys.all, 'librariesV1'],
  migrationInfo: (sourceKeys: string[]) => [...studioHomeQueryKeys.all, 'migrationInfo', ...sourceKeys],
};

export const useLibrariesV1Data = (enabled: boolean = true) => (
  useQuery({
    queryKey: studioHomeQueryKeys.librariesV1(),
    queryFn: getStudioHomeLibraries,
    enabled,
  })
);

export const useMigrationInfo = (sourcesKeys: string[], enabled: boolean = true) => (
  useQuery({
    queryKey: studioHomeQueryKeys.migrationInfo(sourcesKeys),
    queryFn: () => getMigrationInfo(sourcesKeys),
    enabled,
  })
);
