import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectors } from '@src/editors/data/redux';
import { camelizeKeys } from '@src/editors/utils';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { AxiosResponse } from 'axios';
import { resolveHandlerUrl } from '@src/editors/data/services/cms/handlerUrl';

interface UseBlockDataParams<T> {
  blockId: string;
  uniqueId: string;
  handlerName: string;
  defaultData: T;
}

export const immediate = <T>(val: T) =>
  new Promise((resolve) => {
    resolve(val);
  });

// Unique ID required due to intractable race conditions. See ./contexts.tsx file.
export const useBlockHandlerData = <T>({
  blockId,
  uniqueId,
  handlerName,
  defaultData,
}: UseBlockDataParams<T>) => {
  const studioEndpointUrl = useSelector(selectors.app.studioEndpointUrl)!;
  const isLibrary = useSelector(selectors.app.isLibrary);
  const client = getAuthenticatedHttpClient();
  return useQuery<T>({
    queryKey: ['blockHandlerData', blockId, uniqueId, handlerName],
    staleTime: Infinity,
    queryFn: async ({ signal }) => {
      if (!blockId) {
        // No blockId is set yet, so there's nothing to fetch.
        return immediate(defaultData);
      }
      return client.get(
        await resolveHandlerUrl({
          blockId,
          studioEndpointUrl,
          handlerName,
          isLibrary,
        }),
        { cancelSource: signal },
      ).then((res: AxiosResponse<unknown>) => camelizeKeys(res.data) as T);
    },
  });
};
