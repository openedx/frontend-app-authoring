export const LIBRARY_TYPES = {
  VIDEO: 'video', // blockstore/v2
  PROBLEM: 'problem', // blockstore/v2
  COMPLEX: 'complex', // blockstore/v2
  LEGACY: 'legacy', // modulestore/v1
};

export const LOADING_STATUS = {
  STANDBY: 'standby', // Structure has been created but is not yet loading.
  LOADING: 'loading',
  LOADED: 'loaded',
  FAILED: 'failed',
};

export const SUBMISSION_STATUS = {
  UNSUBMITTED: 'unsubmitted',
  SUBMITTING: 'submitting',
  SUBMITTED: 'submitted',
  FAILED: 'failed',
};

export const LIBRARY_ACCESS = {
  ADMIN: 'admin',
  AUTHOR: 'author',
  READ: 'read',
};

export const ROUTES = {
  List: {
    HOME: '/',
    CREATE: '/create',
  },
  Detail: {
    HOME: '/library/:libraryId',
    HOME_SLUG: (libraryId) => `/library/${libraryId}`,
    EDIT: '/library/:libraryId/edit',
    EDIT_SLUG: (libraryId) => `/library/${libraryId}/edit`,
    ACCESS: '/library/:libraryId/access',
    ACCESS_SLUG: (libraryId) => `/library/${libraryId}/access`,
    IMPORT: '/library/:libraryId/import',
    IMPORT_SLUG: (libraryId) => `/library/${libraryId}/import`,
  },
  Block: {
    HOME: '/library/:libraryId/blocks/:blockId',
    HOME_SLUG: (libraryId, blockId) => `/library/${libraryId}/blocks/${blockId}`,
    EDIT: '/library/:libraryId/blocks/:blockId/edit',
    EDIT_SLUG: (libraryId, blockId) => `/library/${libraryId}/blocks/${blockId}/edit`,
    ASSETS: '/library/:libraryId/blocks/:blockId/assets',
    ASSETS_SLUG: (libraryId, blockId) => `/library/${libraryId}/blocks/${blockId}/assets`,
    SOURCE: '/library/:libraryId/blocks/:blockId/source',
    SOURCE_SLUG: (libraryId, blockId) => `/library/${libraryId}/blocks/${blockId}/source`,
    LEARN: '/library/:libraryId/blocks/:blockId/learn',
    LEARN_SLUG: (libraryId, blockId) => `/library/${libraryId}/blocks/${blockId}/learn`,
  },
};

export const XBLOCK_VIEW_SYSTEM = {
  LMS: 'lms',
  Studio: 'studio',
};

/** The following block types are known not to work with content libraries. */
export const BLOCK_TYPE_DENYLIST = [
  'about',
  'annotatable',
  'chapter',
  'conditional',
  'course',
  'course_info',
  'discussion',
  'edx_sga',
  'library',
  'library_content',
  'library_sourced',
  'lti',
  'lti_consumer',
  'openassessment',
  'sequential',
  'split_test',
  'staffgradedxblock',
  'static_tab',
  'unit',
  'vertical',
];

/** The following block types can be included in a content library, but cannot be edited via Studio's author view. */
export const BLOCK_TYPE_EDIT_DENYLIST = [
  'html',
  'problem',
  'video',
  'videoalpha',
  'word_cloud',
];

// This is the only version we support right now.
export const CC_LICENSE_VERSION = '4.0';

export const STORE_NAMES = {
  AUTHORING: 'authoring',
  BLOCKS: 'blocks',
  CREATE: 'create',
  ACCESS: 'access',
  COURSE_IMPORT: 'courseImport',
  LIST: 'list',
  EDIT: 'edit',
};

export const BLOCK_FILTER_ORDER = [
  'video',
  'problem',
  'html',
  '^', // Will be used as a key to indicate 'other component'
  'unit',
  'sequential',
  'chapter',
];
