/**
 * Given a usage key like `lb:org:lib:html:id`, get the type (e.g. `html`)
 * @param usageKey e.g. `lb:org:lib:html:id`
 * @returns The block type as a string
 */
export function getBlockType(usageKey: string): string {
  if (usageKey && usageKey.startsWith('lb:')) {
    const blockType = usageKey.split(':')[3];
    if (blockType) {
      return blockType;
    }
  }
  throw new Error(`Invalid usageKey: ${usageKey}`);
}

/**
 * Given a usage key like `lb:org:lib:html:id`, get the library key
 * @param usageKey e.g. `lb:org:lib:html:id`
 * @returns The library key, e.g. `lib:org:lib`
 */
export function getLibraryId(usageKey: string): string {
  if (usageKey && (usageKey.startsWith('lb:') || usageKey.startsWith('lib-collection:'))) {
    const org = usageKey.split(':')[1];
    const lib = usageKey.split(':')[2];
    if (org && lib) {
      return `lib:${org}:${lib}`;
    }
  }
  throw new Error(`Invalid usageKey: ${usageKey}`);
}

/** Check if this is a V2 library key. */
export function isLibraryKey(learningContextKey: string | undefined | null): learningContextKey is string {
  return typeof learningContextKey === 'string' && learningContextKey.startsWith('lib:');
}

/** Check if this is a V1 library key. */
export function isLibraryV1Key(learningContextKey: string | undefined | null): learningContextKey is string {
  return typeof learningContextKey === 'string' && learningContextKey.startsWith('library-v1:');
}

/**
 * Build a collection usage key from library V2 context key and collection Id.
 * This Collection Usage Key is only used on tagging.
*/
export const buildCollectionUsageKey = (learningContextKey: string, collectionId: string) => {
  if (!isLibraryKey(learningContextKey)) {
    return '';
  }

  const orgLib = learningContextKey.replace('lib:', '');
  return `lib-collection:${orgLib}:${collectionId}`;
};
