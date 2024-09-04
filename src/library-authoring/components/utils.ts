/**
 * Given a usage key like `lb:org:lib:html:id`, get the type (e.g. `html`)
 * @param usageKey e.g. `lb:org:lib:html:id`
 * @returns The block type as a string, or 'unknown'
 */
export function getBlockType(usageKey: string): string {
  return usageKey.split(':')[3] ?? 'unknown';
}

/**
 * Given a usage key like `lb:org:lib:html:id`, get the library key
 * @param usageKey e.g. `lb:org:lib:html:id`
 * @returns The library key, e.g. `lib:org:lib`
 */
export function getLibraryId(usageKey: string): string {
  const org = usageKey.split(':')[1] ?? 'unknown';
  const lib = usageKey.split(':')[2] ?? 'unknown';
  return `lib:${org}:${lib}`;
}

export function getEditUrl(usageKey: string): string | undefined {
  const blockType = getBlockType(usageKey);
  const libraryId = getLibraryId(usageKey);

  const mfeEditorTypes = ['html'];
  if (mfeEditorTypes.includes(blockType)) {
    return `/library/${libraryId}/editor/${blockType}/${usageKey}`;
  }
  return undefined;
}
