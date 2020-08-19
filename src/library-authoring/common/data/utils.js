import { ensureConfig, getConfig } from '@edx/frontend-platform';

import { LIBRARY_TYPES, BLOCK_TYPE_DENYLIST } from './constants';

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
