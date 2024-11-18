import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { Axios } from 'axios';

export const client: () => Axios = getAuthenticatedHttpClient;

/**
 * get(url)
 * simple wrapper providing an authenticated Http client get action
 * @param {string} url - target url
 */
export const get: Axios['get'] = (...args) => client().get(...args);
/**
 * post(url, data)
 * simple wrapper providing an authenticated Http client post action
 * @param {string} url - target url
 * @param {object|string} data - post payload
 */
export const post: Axios['post'] = (...args) => client().post(...args);

/**
 * put(url, data)
 * simple wrapper providing an authenticated Http client put action
 */
export const put: Axios['put'] = (...args) => client().put(...args);

/**
 * delete(url, data)
 * simple wrapper providing an authenticated Http client delete action
 * @param {string} url - target url
 * @param {object|string} data - delete payload
 */
export const deleteObject: Axios['delete'] = (...args) => client().delete(...args);
