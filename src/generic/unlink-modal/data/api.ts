import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getDownstreamApiUrl = (downstreamBlockId: string) => (
  `${getApiBaseUrl()}/api/contentstore/v2/downstreams/${downstreamBlockId}`
);

export const unlinkDownstream = async (downstreamBlockId: string): Promise<void> => {
  await getAuthenticatedHttpClient().delete(getDownstreamApiUrl(downstreamBlockId));
};
