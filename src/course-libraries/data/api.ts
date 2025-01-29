import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

const getEntityLinksByDownstreamContextUrl = (downstreamContextKey: string) => `${getApiBaseUrl()}/api/contentstore/v2/upstreams/${downstreamContextKey}`;


export interface PublishableEntityLink {
  upstreamUsageKey: string;
  upstreamContextKey: string;
  upstreamContextTitle: string;
  upstreamVersion: string;
  downstreamUsageKey: string;
  downstreamContextTitle: string;
  downstreamContextKey: string;
  versionSynced: string;
  versionDeclined: string;
  created: string;
  updated: string;
  readyToSync: boolean;
}

export const getEntityLinksByDownstreamContext = async (downstreamContextKey: string): Promise<PublishableEntityLink[]> => {
  const { data } = await getAuthenticatedHttpClient()
    .get(getEntityLinksByDownstreamContextUrl(downstreamContextKey));
  return camelCaseObject(data);
}
