import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getZendeskrUrl = () => `${getApiBaseUrl()}/zendesk_proxy/v0`;

/**
 * Posts the form data to zendesk endpoint
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function postAccessibilityForm({ name, email, message }) {
  const data = {
    name,
    tags: ['studio_a11y'],
    email: {
      from: email,
      subject: 'Studio Accessibility Request',
      message,
    },
  };

  await getAuthenticatedHttpClient().post(getZendeskrUrl(), data);
}
