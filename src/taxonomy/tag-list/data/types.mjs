// @ts-check

// TODO: this file needs to be merged into src/taxonomy/data/types.mjs
// We are creating a mess with so many different /data/[api|types].js files in subfolders.
// There is only one tagging/taxonomy API, and it should be implemented via a single types.mjs and api.js file.

/**
 * @typedef {Object} QueryOptions
 * @property {number} pageIndex
 * @property {number} pageSize
 */

/**
 * @typedef {Object} TagData
 * @property {number} childCount
 * @property {number} depth
 * @property {string} externalId
 * @property {number} id
 * @property {string | null} parentValue
 * @property {string | null} subTagsUrl
 * @property {string} value Unique ID for this tag, also its display text
 * @property {number?} usageCount
 * @property {string?} _id Database ID. Don't rely on this, as it is not present for free-text tags.
 */

/**
 * @typedef {Object} TagListData
 * @property {number} count
 * @property {number} currentPage
 * @property {string} next
 * @property {number} numPages
 * @property {string} previous
 * @property {TagData[]} results
 * @property {number} start
 */
