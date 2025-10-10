import Cookies from 'universal-cookie';

import { LAST_IMPORT_COOKIE_NAME } from './data/constants';

/**
 * Sets an import-related cookie with the provided information.
 *
 * @param date - Date of import (unix timestamp).
 * @param {boolean} completed - Indicates if import was completed successfully.
 * @param {string} fileName - File name.
 */
export const setImportCookie = (date: number, completed: boolean, fileName: string): void => {
  const cookies = new Cookies();
  cookies.set(LAST_IMPORT_COOKIE_NAME, { date, completed, fileName }, { path: window.location.pathname });
};
