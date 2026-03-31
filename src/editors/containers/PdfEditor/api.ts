import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectors } from '@src/editors/data/redux';
import { camelizeKeys } from '@src/editors/utils';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { Axios, AxiosResponse } from 'axios';
import * as urls from '@src/editors/data/services/cms/urls';

interface UseBlockDataParams<T> {
  blockId: string,
  uniqueId: string,
  handlerName: string,
  defaultData: T,
}

interface DeriveHandlerUrlParams {
  studioEndpointUrl: string,
  blockId: string,
  handlerName: string,
  isLibrary: boolean,
  client: Axios,
}

export const immediate = <T>(val: T) => new Promise((resolve) => { resolve(val); });

const deriveHandlerUrl = async ({
  studioEndpointUrl, blockId, handlerName, isLibrary, client,
}: DeriveHandlerUrlParams) => {
  if (isLibrary) {
    return client.get(urls.boundHandlerUrl({ studioEndpointUrl, blockId, handlerName })).then(
      (response: AxiosResponse<{ handler_url: string }>) => response.data.handler_url,
    );
  }
  return urls.handlerUrl({ blockId, studioEndpointUrl, handlerName });
};

// Unique ID required due to intractable race conditions. See ./contexts.tsx file.
export const useBlockHandlerData = <T>({
  blockId, uniqueId, handlerName, defaultData,
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
        await deriveHandlerUrl({
          blockId, studioEndpointUrl, handlerName, isLibrary, client,
        }),
        { cancelSource: signal },
      ).then((res: AxiosResponse<unknown>) => camelizeKeys(res.data) as T);
    },
  });
};
