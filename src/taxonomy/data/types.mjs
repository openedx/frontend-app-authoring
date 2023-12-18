// @ts-check

/**
 * @typedef {Object} TaxonomyData
 * @property {number} id
 * @property {string} name
 * @property {boolean} enabled
 * @property {boolean} allowMultiple
 * @property {boolean} allowFreeText
 * @property {boolean} systemDefined
 * @property {boolean} visibleToAuthors
 * @property {string[]} orgs
 */

/**
 * @typedef {Object} TaxonomyListData
 * @property {string} next
 * @property {string} previous
 * @property {number} count
 * @property {number} numPages
 * @property {number} currentPage
 * @property {number} start
 * @property {function} refetch
 * @property {TaxonomyData[]} results
 */
