import { ensureConfig, getConfig } from '@edx/frontend-platform';

import { logError as platformLogger } from '@edx/frontend-platform/logging';
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
    url = `/library-authoring/library/${library.id}`;
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

/** Truncate a message to 255 characters if it's longer than that. */
export const truncateMessage = (message) => (
  message.length > 255 ? `${message.substring(0, 255)}...` : message
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

/**
 * Need to be able to mock out the logger without affecting other definitions in the library.
 */
let logger = platformLogger;

if (process.env.NODE_ENV === 'test') {
  logger = jest.fn();
}

export const logError = logger;

/**
 * Proxy object that allows us to know WHICH intl message was missing by sending it to the console. Also
 * aids in testing by forcing failure if a message is missing. Wrap your messages dictionaries with it.
 */
export const messageGuard = (messageSet) => {
  if (process.env.NODE_ENV === 'production') {
    return messageSet;
  }
  return new Proxy(messageSet, {
    get: (target, key) => {
      if (process.env.NODE_ENV === 'test') {
        // Fatal when running tests.
        expect(key).i18nDefinedIn(target);
      }
      if (target[key] === undefined) {
        const error = new Error(`i18n error: "${key}" is not a known message key.`);
        logError(error);
        return {
          // Should never actually get translated. We just want to quell the error message from upstream.
          id: `meta.i18n.missing_key.${key}`,
          defaultMessage: `"${key}" MISSING!`,
          description: 'Diagnostic error message for missing i18n messages. Do not translate.',
        };
      }
      return target[key];
    },
  });
};

// We need a way to spy on thunks effectively. This allows us to intercept all calls to thunks which have been
// annotated with annotateThunk, and keep track of what they were called with. We can also make these thunks return
// or throw by using their respective resolve and reject commands.
const thunkMockMap = new Map();
const testSettings = { useRealThunks: false, useRealApis: false };
let thunkWrapper = (thunk) => thunk;

if (process.env.NODE_ENV === 'test') {
  thunkWrapper = (thunk) => {
    const wrapper = (...args) => (dispatch) => {
      if (testSettings.useRealThunks) {
        // Less useful to have this information in this case, but for sake of consistency, including it.
        // Note that reject and resolve will be undefined for cases where we're not mocking out the promise.
        thunkMockMap.get(wrapper).calls.push({ args, dispatch });
        return thunk(dispatch)(...args);
      }
      return new Promise((resolve, reject) => {
        thunkMockMap.get(wrapper).calls.push({
          args,
          resolve,
          reject,
          dispatch,
        });
        wrapper.fn(...args);
      });
    };
    const fn = jest.fn();
    thunkMockMap.set(wrapper, { fn, calls: [] });
    Object.defineProperty(wrapper, 'calls', { get: () => thunkMockMap.get(wrapper).calls });
    // Now we can do expect(thunk).fn.toHaveBeenCalledWith(whatever)
    wrapper.fn = fn;
    return wrapper;
  };
}

export const annotateThunk = thunkWrapper;
export const resetThunks = () => {
  thunkMockMap.forEach((value) => {
    value.fn.mockReset();
    // eslint-disable-next-line no-param-reassign
    value.calls = [];
  });
};

// Change context so that we can enable or disable the behavior of real thunks. We still record information about
// the calls, but we let the thunk code return its own values if this is enabled.
export const useRealThunks = (value) => {
  testSettings.useRealThunks = value;
};

// Same deal, but for simpler async functions like API calls.
let apiWrapper = (func) => func;

if (process.env.NODE_ENV === 'test') {
  apiWrapper = (func) => {
    const wrapper = (...args) => {
      if (testSettings.useRealApis) {
        // We can still act as a spy here.
        wrapper.fn(...args);
        return func(...args);
      }
      // You'll want to use Immediate(value) or InstaFail(value) as mockImplementation, depending on what you're
      // testing.
      return wrapper.fn(...args);
    };
    wrapper.fn = jest.fn();
    return wrapper;
  };
}

export const annotateCall = apiWrapper;
const apiMockMap = new Map();

export const useRealApis = (value) => {
  testSettings.useRealApis = value;
};

export const resetApis = () => {
  apiMockMap.forEach((value) => {
    value.fn.mockReset();
  });
};
