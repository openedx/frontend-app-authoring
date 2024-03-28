// @ts-check

/**
 * @typedef {Object} Tag A tag that has been applied to some content.
 * @property {string} value The value of the tag, also its ID. e.g. "Biology"
 * @property {string[]} lineage The values of the tag and its parent(s) in the hierarchy
 * @property {boolean} canChangeObjecttag
 * @property {boolean} canDeleteObjecttag
 */

/**
 * @typedef {Object} ContentTaxonomyTagData A list of the tags from one taxonomy that are applied to a content object.
 * @property {string} name
 * @property {number} taxonomyId
 * @property {boolean} canTagObject
 * @property {Tag[]} tags
 */

/**
 * @typedef {Object} ContentTaxonomyTagsData A list of all the tags applied to some content object, grouped by taxonomy.
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
 * @typedef {Object} XBlockData
 * @property {string} id
 * @property {string} displayName
 * @property {string} category
 * @property {boolean} hasChildren
 * @property {string} editedOn
 * @property {boolean} published
 * @property {string} publishedOn
 * @property {string} studioUrl
 * @property {boolean} releasedToStudents
 * @property {string|null} releaseDate
 * @property {string} visibilityState
 * @property {boolean} hasExplicitStaffLock
 * @property {string} start
 * @property {boolean} graded
 * @property {string} dueDate
 * @property {string} due
 * @property {string|null} relativeWeeksDue
 * @property {string|null} format
 * @property {boolean} hasChanges
 * @property {ContentActions} actions
 * @property {string} explanatoryMessage
 * @property {string} showCorrectness
 * @property {boolean} discussionEnabled
 * @property {boolean} ancestorHasStaffLock
 * @property {boolean} staffOnlyMessage
 * @property {boolean} hasPartitionGroupComponents
 */

/**
  * @typedef {Object} CourseData
  * @property {string} courseDisplayNameWithDefault
  */

/**
 * @typedef {XBlockData | CourseData} ContentData
 */
