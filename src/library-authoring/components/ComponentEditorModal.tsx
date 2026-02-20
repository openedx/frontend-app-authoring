import { getConfig } from '@edx/frontend-platform';
import React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import EditorPage from '@src/editors/EditorPage';
import { getBlockType } from '@src/generic/key-utils';

import { useLibraryContext } from '../common/context/LibraryContext';
import { invalidateComponentData } from '../data/apiHooks';

export function canEditComponent(usageKey: string): boolean {
  let blockType: string;
  try {
    blockType = getBlockType(usageKey);
  } catch {
    return false;
  }

  return !getConfig().LIBRARY_UNSUPPORTED_BLOCKS.includes(blockType);
}

export const ComponentEditorModal: React.FC<Record<never, never>> = () => {
  const { componentBeingEdited, closeComponentEditor, libraryId } = useLibraryContext();
  const queryClient = useQueryClient();

  if (componentBeingEdited === undefined) {
    return null;
  }
  const blockType = componentBeingEdited.blockType || getBlockType(componentBeingEdited.usageKey);

  const onClose = (data?:any) => {
    closeComponentEditor(data);
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
      returnFunction={() => onClose}
    />
  );
};
