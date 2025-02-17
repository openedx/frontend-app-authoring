import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getEntityLinksByDownstreamContextUrl = (downstreamContextKey: string) => `${getApiBaseUrl()}/api/contentstore/v2/upstreams/${downstreamContextKey}`;

export interface PublishableEntityLink {
  id: number;
  upstreamUsageKey: string;
  upstreamContextKey: string;
  upstreamContextTitle: string;
  upstreamVersion: number;
  downstreamUsageKey: string;
  downstreamContextTitle: string;
  downstreamContextKey: string;
  versionSynced: string;
  versionDeclined: string;
  created: string;
  updated: string;
  readyToSync: boolean;
}

export const getEntityLinksByDownstreamContext = async (
  downstreamContextKey: string,
  readyToSync?: boolean,
): Promise<PublishableEntityLink[]> => {
  const { data } = await getAuthenticatedHttpClient()
    .get(getEntityLinksByDownstreamContextUrl(downstreamContextKey), {
      params: { ready_to_sync: readyToSync },
    });
  return camelCaseObject(data);
};
