import { getConfig } from '@edx/frontend-platform';
import React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import EditorPage from '../../editors/EditorPage';
import { getBlockType } from '../../generic/key-utils';
import { useLibraryContext } from '../common/context/LibraryContext';
import { invalidateComponentData } from '../data/apiHooks';

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
  const queryClient = useQueryClient();

  if (componentBeingEdited === undefined) {
    return null;
  }
  const blockType = getBlockType(componentBeingEdited.usageKey);

  const onClose = () => {
    closeComponentEditor();
    invalidateComponentData(queryClient, libraryId, componentBeingEdited.usageKey);
  };

  return (
    <EditorPage
      courseId={libraryId}
      blockType={blockType}
      blockId={componentBeingEdited.usageKey}
      studioEndpointUrl={getConfig().STUDIO_BASE_URL}
      lmsEndpointUrl={getConfig().LMS_BASE_URL}
      onClose={onClose}
      returnFunction={() => { onClose(); return () => {}; }}
      fullScreen={false}
    />
  );
};
