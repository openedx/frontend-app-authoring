import Cookies from 'universal-cookie';
import moment from 'moment';

import { TIME_FORMAT } from '../constants';
import { LAST_EXPORT_COOKIE_NAME, SUCCESS_DATE_FORMAT } from './data/constants';

/**
 * Sets an export-related cookie with the provided information.
 *
 * @param {Date} date - Date of export.
 * @param {boolean} completed - Indicates if export was completed successfully.
 * @returns {void}
 */
export const setExportCookie = (date, completed) => {
  const cookies = new Cookies();
  cookies.set(LAST_EXPORT_COOKIE_NAME, { date, completed }, { path: window.location.pathname });
};

/**
 * Formats a Unix timestamp as a formatted success date string.
 *
 * @param {number} unixDate - Unix timestamp to be formatted.
 * @returns {string|null} Formatted success date string, including date and time in UTC, or null if the input is falsy.
 */
export const getFormattedSuccessDate = (unixDate) => {
  const formattedDate = moment(unixDate).utc().format(SUCCESS_DATE_FORMAT);
  const formattedTime = moment(unixDate).utc().format(TIME_FORMAT);
  return unixDate ? ` (${formattedDate} at ${formattedTime} UTC)` : null;
};
