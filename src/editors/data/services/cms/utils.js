import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * get(url)
 * simple wrapper providing an authenticated Http client get action
 * @param {string} url - target url
 */
export const get = (...args) => getAuthenticatedHttpClient().get(...args);
/**
 * post(url, data)
 * simple wrapper providing an authenticated Http client post action
 * @param {string} url - target url
 * @param {object|string} data - post payload
 */
export const post = (...args) => getAuthenticatedHttpClient().post(...args);
/**
 * delete(url, data)
 * simple wrapper providing an authenticated Http client delete action
 * @param {string} url - target url
 * @param {object|string} data - delete payload
 */
export const deleteObject = (...args) => getAuthenticatedHttpClient().delete(...args);

export const client = getAuthenticatedHttpClient;
