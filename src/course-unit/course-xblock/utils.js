import { STYLE_TAG_PATTERN } from './constants';

/**
 * Extracts content of <style> tags from the given HTML string.
 * @param {string} htmlString - The HTML string to extract styles from.
 * @returns {string[]} An array containing the content of <style> tags.
 */
// eslint-disable-next-line import/prefer-default-export
export function extractStylesWithContent(htmlString) {
  const matches = [];
  let match = STYLE_TAG_PATTERN.exec(htmlString);

  while (match !== null) {
    matches.push(match[1]); // Pushing content of <style> tag
    match = STYLE_TAG_PATTERN.exec(htmlString);
  }

  return matches;
}
