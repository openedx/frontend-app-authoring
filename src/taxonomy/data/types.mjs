// @ts-check

/**
 * @typedef {Object} TaxonomyData
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} enabled
 * @property {boolean} allowMultiple
 * @property {boolean} allowFreeText
 * @property {boolean} systemDefined
 * @property {boolean} visibleToAuthors
 * @property {string[]} orgs
 * @property {boolean} allOrgs
 * @property {number} tagsCount
 */

/**
 * @typedef {Object} TaxonomyListData
 * @property {string} next
 * @property {string} previous
 * @property {number} count
 * @property {number} num_pages
 * @property {number} current_page
 * @property {number} start
 * @property {function} refetch
 * @property {TaxonomyData[]} results
 */
