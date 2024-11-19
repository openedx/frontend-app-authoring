import Cookies from 'universal-cookie';

import { LAST_IMPORT_COOKIE_NAME } from './data/constants';

/**
 * Sets an import-related cookie with the provided information.
 *
 * @param {Date} date - Date of import.
 * @param {boolean} completed - Indicates if import was completed successfully.
 * @param {string} fileName - File name.
 * @returns {void}
 */
export const setImportCookie = (date, completed, fileName) => {
  const cookies = new Cookies();
  cookies.set(LAST_IMPORT_COOKIE_NAME, { date, completed, fileName }, { path: window.location.pathname });
};
