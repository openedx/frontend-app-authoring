// @ts-check

/**
 * @typedef {Object} Tag
 * @property {string} value
 * @property {string[]} lineage
 */

/**
 * @typedef {Object} ContentTaxonomyTagData
 * @property {string} name
 * @property {number} taxonomy_id
 * @property {boolean} editable
 * @property {Tag[]} tags
 */

/**
 * @typedef {Object} ContentTaxonomyTagsData
 * @property {ContentTaxonomyTagData[]} taxonomies
 */

/**
 * @typedef {Object} ContentActions
 * @property {boolean} deleteable
 * @property {boolean} draggable
 * @property {boolean} childAddable
 * @property {boolean} duplicable
 */

/**
 * @typedef {Object} ContentData
 * @property {string} id
 * @property {string} display_name
 * @property {string} category
 * @property {boolean} has_children
 * @property {string} edited_on
 * @property {boolean} published
 * @property {string} published_on
 * @property {string} studio_url
 * @property {boolean} released_to_students
 * @property {string} release_date
 * @property {string} visibility_state
 * @property {boolean} has_explicit_staff_lock
 * @property {string} start
 * @property {boolean} graded
 * @property {string} due_date
 * @property {string} due
 * @property {string} relative_weeks_due
 * @property {string} format
 * @property {boolean} has_changes
 * @property {ContentActions} actions
 * @property {string} explanatory_message
 * @property {string} show_correctness
 * @property {boolean} discussion_enabled
 * @property {boolean} ancestor_has_staff_lock
 * @property {boolean} staff_only_message
 * @property {boolean} enable_copy_paste_units
 * @property {boolean} has_partition_group_components
 */

/**
 * @typedef {Object} TaxonomyTagData
 * @property {string} id
 * @property {string} display_name
 * @property {string} category
 * @property {boolean} has_children
 * @property {string} edited_on
 * @property {boolean} published
 * @property {string} published_on
 * @property {string} studio_url
 * @property {boolean} released_to_students
 * @property {string} release_date
 * @property {string} visibility_state
 * @property {boolean} has_explicit_staff_lock
 * @property {string} start
 * @property {boolean} graded
 * @property {string} due_date
 * @property {string} due
 * @property {string} relative_weeks_due
 * @property {string} format
 * @property {boolean} has_changes
 * @property {ContentActions} actions
 * @property {string} explanatory_message
 * @property {string} show_correctness
 * @property {boolean} discussion_enabled
 * @property {boolean} ancestor_has_staff_lock
 * @property {boolean} staff_only_message
 * @property {boolean} enable_copy_paste_units
 * @property {boolean} has_partition_group_components
 */

/**
 * @typedef {Object} TaxonomyTagsData
 * @property {string} next
 * @property {string} previous
 * @property {number} count
 * @property {number} num_pages
 * @property {number} current_page
 * @property {number} start
 * @property {TaxonomyTagData[]} results
 */

