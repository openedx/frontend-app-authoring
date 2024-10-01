import { getConfig } from '@edx/frontend-platform';
import React from 'react';

import { useLibraryContext } from '../common/context';
import { getBlockType } from '../../generic/key-utils';
import EditorPage from '../../editors/EditorPage';

/* eslint-disable import/prefer-default-export */
export function canEditComponent(usageKey: string): boolean {
  let blockType: string;
  try {
    blockType = getBlockType(usageKey);
  } catch {
    return false;
  }

  // Which XBlock/component types are supported by the 'editors' built in to this repo?
  const mfeEditorTypes = ['html', 'problem', 'video'];
  return mfeEditorTypes.includes(blockType);
}

export const ComponentEditorModal: React.FC<Record<never, never>> = () => {
  const { componentBeingEdited, closeComponentEditor, libraryId } = useLibraryContext();

  if (componentBeingEdited === undefined) {
    return null;
  }
  const blockType = getBlockType(componentBeingEdited);

  return (
    <EditorPage
      courseId={libraryId}
      blockType={blockType}
      blockId={componentBeingEdited}
      studioEndpointUrl={getConfig().STUDIO_BASE_URL}
      lmsEndpointUrl={getConfig().LMS_BASE_URL}
      onClose={closeComponentEditor}
      returnFunction={() => { closeComponentEditor(); return () => {}; }}
      fullScreen={false}
    />
  );
};
