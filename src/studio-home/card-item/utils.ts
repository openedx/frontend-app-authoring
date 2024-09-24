/**
 * Removes leading and trailing slashes from a string.
 * @param {string} str - The string to trim.
 * @returns {string} The trimmed string.
 */
// eslint-disable-next-line import/prefer-default-export
export const trimSlashes = (str: string): string => str.replace(/^\/|\/$/g, '');
