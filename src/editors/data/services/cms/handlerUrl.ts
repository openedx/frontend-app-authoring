import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { AxiosResponse } from 'axios';

import * as urls from './urls';

export interface ResolveHandlerUrlArgs {
  studioEndpointUrl: string;
  blockId: string;
  handlerName: string;
  isLibrary: boolean;
}

/**
 * The URL of one of a block's own XBlock handlers.
 *
 * Course blocks have a fixed handler route. Library blocks do not: the server
 * issues their handler URLs, so each one is asked for first. The result is
 * not cached because an issued URL carries a token that expires.
 */
export const resolveHandlerUrl = async ({
  studioEndpointUrl,
  blockId,
  handlerName,
  isLibrary,
}: ResolveHandlerUrlArgs): Promise<string> => {
  if (isLibrary) {
    const { data }: AxiosResponse<{ handler_url: string; }> = await getAuthenticatedHttpClient().get(
      urls.boundHandlerUrl({ studioEndpointUrl, blockId, handlerName }),
    );
    return data.handler_url;
  }
  return urls.handlerUrl({ studioEndpointUrl, blockId, handlerName });
};
