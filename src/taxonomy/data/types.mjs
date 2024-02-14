// @ts-check

/**
 * @typedef {Object} TaxonomyData Metadata about a taxonomy
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} exportId
 * @property {boolean} enabled
 * @property {boolean} allowMultiple
 * @property {boolean} allowFreeText
 * @property {boolean} systemDefined
 * @property {boolean} visibleToAuthors
 * @property {number} tagsCount
 * @property {string[]} orgs
 * @property {boolean} allOrgs
 * @property {boolean} canChangeTaxonomy
 * @property {boolean} canDeleteTaxonomy
 * @property {boolean} canTagObject
 */

/**
 * @typedef {Object} TaxonomyListData The list of taxonomies
 * @property {string} next
 * @property {string} previous
 * @property {number} count
 * @property {number} numPages
 * @property {number} currentPage
 * @property {number} start
 * @property {boolean} canAddTaxonomy
 * @property {TaxonomyData[]} results
 */
