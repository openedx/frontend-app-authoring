/**
 * Given a usage key like `lb:org:lib:html:id`, get the type (e.g. `html`)
 * @param usageKey e.g. `lb:org:lib:html:id`
 * @returns The block type as a string
 */
export function getBlockType(usageKey: string): string {
  if (usageKey && (usageKey.startsWith('lb:') || usageKey.startsWith('lct:'))) {
    const blockType = usageKey.split(':')[3];
    if (blockType) {
      return blockType;
    }
  }
  throw new Error(`Invalid usageKey: ${usageKey}`);
}

/**
 * Parses a library key and returns the organization and library name as an object.
 */
export function parseLibraryKey(libraryKey: string): { org: string, lib: string } {
  const splitKey = libraryKey?.split(':') || [];
  if (splitKey.length !== 3) {
    throw new Error(`Invalid libraryKey: ${libraryKey}`);
  }
  const [, org, lib] = splitKey;
  if (org && lib) {
    return { org, lib };
  }
  throw new Error(`Invalid libraryKey: ${libraryKey}`);
}

/**
 * Given a usage key like `lb:org:lib:html:id`, get the library key
 * @param usageKey e.g. `lb:org:lib:html:id`
 * @returns The library key, e.g. `lib:org:lib`
 */
export function getLibraryId(usageKey: string): string {
  const [blockType, org, lib] = usageKey?.split(':') || [];

  if (['lb', 'lib-collection', 'lct'].includes(blockType) && org && lib) {
    return `lib:${org}:${lib}`;
  }
  throw new Error(`Invalid usageKey: ${usageKey}`);
}

/**
 * Given a usage key like `block-v1:org:course:html:id`, get the course key
 */
export function getCourseKey(usageKey: string): string {
  const [prefix] = usageKey?.split('@') || [];
  const [blockType, courseInfo] = prefix?.split(':') || [];
  const [org, course, run] = courseInfo?.split('+') || [];

  if (blockType === 'block-v1' && org && course && run) {
    return `course-v1:${org}+${course}+${run}`;
  }
  throw new Error(`Invalid usageKey: ${usageKey}`);
}

/** Check if this is a course key */
export function isCourseKey(learningContextKey: string | undefined | null): learningContextKey is string {
  return typeof learningContextKey === 'string' && learningContextKey.startsWith('course-v1:');
}

/** Check if this is a V2 library key. */
export function isLibraryKey(learningContextKey: string | undefined | null): learningContextKey is string {
  return typeof learningContextKey === 'string' && learningContextKey.startsWith('lib:');
}

/** Check if this is a V1 library key. */
export function isLibraryV1Key(learningContextKey: string | undefined | null): learningContextKey is string {
  return typeof learningContextKey === 'string' && learningContextKey.startsWith('library-v1:');
}

/** Check if this is a V1 block key. */
export function isBlockV1Key(usageKey: string | undefined | null): usageKey is string {
  return typeof usageKey === 'string' && usageKey.startsWith('block-v1:');
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

export enum ContainerType {
  Section = 'section',
  Subsection = 'subsection',
  Unit = 'unit',
  /**
   * Chapter, Sequential and Vertical are the old names for section, subsection and unit.
   * Generally, **please avoid using this term entirely in any libraries code** or
   * anything based on the new Learning Core "Containers" framework - just call it a unit, section or subsection. We
   * do still need to use this in the modulestore-based courseware, and currently the /xblock/ API used to copy
   * library containers into courses also requires specifying this, though that should change to a better API
   * that does the unit->vertical conversion automatically in the future.
   */
  Chapter = 'chapter',
  Sequential = 'sequential',
  Vertical = 'vertical',
  /**
   * Components are not strictly a container type, but we add this here for simplicity when rendering the container
   * hierarchy.
   */
  Components = 'components',
}

/**
 * Normalize a container type to the standard version. For example, 'sequential' will be normalized to 'subsection'.
 */
export function normalizeContainerType(containerType: ContainerType | string) {
  switch (containerType) {
    case ContainerType.Chapter:
      return ContainerType.Section;
    case ContainerType.Sequential:
      return ContainerType.Subsection;
    case ContainerType.Vertical:
      return ContainerType.Unit;
    default:
      return containerType;
  }
}
