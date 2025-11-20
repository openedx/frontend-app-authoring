import { getConfig } from '@edx/frontend-platform';

export const getApiUrl = (path: string) => `${getConfig().LMS_BASE_URL}${path || ''}`;
export const getStudioApiUrl = (path: string) => `${getConfig().STUDIO_BASE_URL}${path || ''}`;
