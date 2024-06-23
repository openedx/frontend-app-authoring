// @ts-check

/**
 * @typedef {Object} LibraryV2
 * @property {string} id - The ID of the v2 library.
 * @property {string} type - The type of the v2 library.
 * @property {string} org - The organization associated with the v2 library.
 * @property {string} slug - The slug for the v2 library.
 * @property {string} title - The title of the v2 library.
 * @property {string} description - The description of the v2 library.
 * @property {number} numBlocks - The number of blocks in the v2 library.
 * @property {number} version - The version of the v2 library.
 * @property {string|null} lastPublished - The date when the v2 library was last published.
 * @property {boolean} allowLti - Indicates if LTI is allowed.
 * @property {boolean} allowPublicLearning - Indicates if public learning is allowed.
 * @property {boolean} allowPublicRead - Indicates if public read is allowed.
 * @property {boolean} hasUnpublishedChanges - Indicates if there are unpublished changes.
 * @property {boolean} hasUnpublishedDeletes - Indicates if there are unpublished deletes.
 * @property {string} license - The license of the v2 library.
 */

/**
 * @typedef {Object} LibrariesV2Response
 * @property {string|null} next - The URL for the next page of results, or null if there is no next page.
 * @property {string|null} previous - The URL for the previous page of results, or null if there is no previous page.
 * @property {number} count - The total number of v2 libraries.
 * @property {number} numPages - The total number of pages.
 * @property {number} currentPage - The current page number.
 * @property {number} start - The starting index of the results.
 * @property {LibraryV2[]} results - An array of library objects.
 */
