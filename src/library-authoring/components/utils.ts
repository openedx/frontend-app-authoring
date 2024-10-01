import { getBlockType, getLibraryId } from '../../generic/key-utils';

/* eslint-disable import/prefer-default-export */
export function getEditUrl(usageKey: string): string | undefined {
  let blockType: string;
  let libraryId: string;
  try {
    blockType = getBlockType(usageKey);
    libraryId = getLibraryId(usageKey);
  } catch {
    return undefined;
  }

  // Which XBlock/component types are supported by the 'editors' built in to this repo?
  const mfeEditorTypes = ['html', 'problem', 'video'];
  if (mfeEditorTypes.includes(blockType)) {
    return `/library/${libraryId}/editor/${blockType}/${usageKey}`;
  }
  return undefined;
}
