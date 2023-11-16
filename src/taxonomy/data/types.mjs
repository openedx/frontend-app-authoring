// @ts-check

/** 
 * @typedef {Object} TaxonomyData
 * @property {number} id
 * @property {string} name
 * @property {boolean} enabled
 * @property {boolean} allow_multiple
 * @property {boolean} allow_free_text
 * @property {boolean} system_defined
 * @property {boolean} visible_to_authors
 */

/**
 * @typedef {Object} TaxonomyListData
 * @property {string} next
 * @property {string} previous
 * @property {number} count
 * @property {number} num_pages
 * @property {number} current_page
 * @property {number} start
 * @property {TaxonomyData[]} results
 */

/**
 * @typedef {Object} QueryTaxonomyListData
 * @property {TaxonomyListData} data
 */

/**
 * @typedef {Object} UseQueryResult
 * @property {Object} data
 * @property {string} status
 */
