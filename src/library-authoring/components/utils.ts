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
  if (usageKey && usageKey.startsWith('lb:')) {
    const org = usageKey.split(':')[1];
    const lib = usageKey.split(':')[2];
    if (org && lib) {
      return `lib:${org}:${lib}`;
    }
  }
  throw new Error(`Invalid usageKey: ${usageKey}`);
}

export function getEditUrl(usageKey: string): string | undefined {
  let blockType: string;
  let libraryId: string;
  try {
    blockType = getBlockType(usageKey);
    libraryId = getLibraryId(usageKey);
  } catch {
    return undefined;
  }

  const mfeEditorTypes = ['html'];
  if (mfeEditorTypes.includes(blockType)) {
    return `/library/${libraryId}/editor/${blockType}/${usageKey}`;
  }
  return undefined;
}
