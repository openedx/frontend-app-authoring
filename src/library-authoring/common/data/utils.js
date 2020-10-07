import { ensureConfig, getConfig } from '@edx/frontend-platform';

import { LIBRARY_TYPES, BLOCK_TYPE_DENYLIST, CC_LICENSE_VERSION } from './constants';

ensureConfig(['STUDIO_BASE_URL'], 'library utils');

/* Add a "url" property to the library object, set to the proper library URL
 * according to its type. */
export const initLibraryUrl = (library) => {
  if (library == null) {
    return null;
  }

  let url;
  if (library.type === LIBRARY_TYPES.LEGACY) {
    url = `${getConfig().STUDIO_BASE_URL}/library/${library.id}`;
  } else {
    url = `/library/${library.id}`;
  }

  return {
    ...library,
    url,
  };
};

/** Remove unsupported block types from a library object. */
export const filterSupportedBlockTypes = (library) => {
  if (library === null) {
    return null;
  }

  if (library.blockTypes === null) {
    return library;
  }

  const blockTypes = library.blockTypes.filter(blockType => (
    !BLOCK_TYPE_DENYLIST.includes(blockType.block_type)
  ));

  return {
    ...library,
    blockTypes,
  };
};

/** Given a v1 library key, unpack it into org and slug. */
export const unpackLibraryKey = (key) => {
  const re = /library-v1:(?<org>.+)\+(?<slug>.+)/;
  const match = key.match(re);
  if (match) {
    return match.groups;
  }
  return {
    org: null,
    slug: null,
  };
};

/** Truncate an error message to 255 characters if it's longer than that. */
export const truncateErrorMessage = (errorMessage) => (
  errorMessage.length > 255 ? `${errorMessage.substring(0, 255)}...` : errorMessage
);


const tagMap = [
  ['attribution', 'BY'],
  ['nonCommercial', 'NC'],
  ['noDerivatives', 'ND'],
  ['shareAlike', 'SA'],
];

// Some flags for Creative Commons are mutually exclusive.
const exclusiveMap = {
  noDerivatives: 'shareAlike',
  shareAlike: 'noDerivatives',
};

const defaultFlags = {
  attribution: true,
  nonCommercial: false,
  noDerivatives: false,
  shareAlike: false,
};

const optionsMatchers = {
  // Always required. Don't give the chance for junk data to break this.
  attribution: /.*/,
  nonCommercial: /:NC(:|$)/,
  noDerivatives: /:ND(:|$)/,
  shareAlike: /:SA(:|$)/,
};

/**
 * @typedef {{noDerivatives: boolean, nonCommercial: boolean, attribution: boolean, shareAlike: boolean}} CommonsOptions
 */


/**
 * Given a current set of options for Creative Commons, change the flag to the requested value and return
 * a new object with the result. This makes sure mutually exclusive flags are turned off.
 *
 * @param {CommonsOptions} commonsOptions
 * @param {string} key
 * @param {boolean} value
 * @returns {CommonsOptions}
 */
export const withCommonsOption = (commonsOptions, key, value) => {
  const results = {
    ...commonsOptions,
  };
  results[key] = value;
  const remove = exclusiveMap[key];
  if (value && remove) {
    results[remove] = false;
  }
  return results;
};

/**
 * Given a license spec string, like 'CC:4.0:SA:NC', derive the Creative Commons options the license declares.
 * @param {string} spec
 * @returns {CommonsOptions}
 */
export const commonsOptionsFromSpec = (spec) => {
  let results = { ...defaultFlags };
  Object.keys(optionsMatchers).forEach((key) => {
    if (spec.match(optionsMatchers[key])) {
      results = withCommonsOption(results, key, true);
      // Make sure if we're adding a flag, that we turn off any mutually exclusive flag.
      if (exclusiveMap[key]) {
        results[exclusiveMap[key]] = false;
      }
    }
  });
  return results;
};

/**
 * flagsFromCommonsOptions
 * Given a CommonsOptions object, returns an array of flags for Creative Commons licenses in their
 * expected order.
 * @param {CommonsOptions} commonsOptions
 * @returns {string[]}
 */
export const flagsFromCommonsOptions = (commonsOptions) => {
  const flags = [];
  // Construct the flags in a consistent order
  tagMap.forEach(([propName, sym]) => {
    if (commonsOptions[propName]) {
      flags.push(sym);
    }
  });
  return flags;
};

/**
 * Given a CommonsOptions object, returns a license 'spec' (string) that can be desconstructed back into a set of
 * CommonsOptions if needed for easy DB storage and internationalization.
 * @param {CommonsOptions} commonsOptions
 * @returns {string}
 */
export const specFromCommonsOptions = (commonsOptions) => {
  const specSections = ['CC', CC_LICENSE_VERSION];
  specSections.push(...flagsFromCommonsOptions(commonsOptions));
  return specSections.join(':');
};

/**
 * Given a set of flags, constructs the URL for the relevant creative commons license.
 * @param {string[]} flags
 * @returns {string}
 */
export const linkFromFlags = (flags) => (
  `https://creativecommons.org/licenses/${flags.join('-').toLowerCase()}/${CC_LICENSE_VERSION}/`
);

/**
 * Clearly named convenience function for turning a license spec string into a link.
 * @param {string} spec
 * @returns {string}
 */
export const linkFromSpec = (spec) => linkFromFlags(
  flagsFromCommonsOptions(
    commonsOptionsFromSpec(spec),
  ),
);
