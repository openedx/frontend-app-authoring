import { getConfig } from '@edx/frontend-platform';

export const imageDisplayUrl = (url: string): string => {
  const studioEndpointUrl = getConfig().STUDIO_BASE_URL;
  if (!url || url.startsWith('http')) { return url; }
  return `${studioEndpointUrl}${url}`;
};
