import { useReducer } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useCreateTag, useUpdateTag } from '../data/apiHooks';
import { TagTree } from './tagTree';
import type { RowId } from '../tree-table/types';
import {
  TABLE_MODES,
  TRANSITION_TABLE,
  TABLE_MODE_ACTIONS,
  TAG_NAME_PATTERN,
} from './constants';

import messages from './messages';

export interface TableModeAction {
  type: string;
  targetMode: string;
}

interface UseTableModesReturn {
  tableMode: string;
  enterDraftMode: () => void;
  exitDraftWithoutSave: () => void;
  enterPreviewMode: () => void;
  enterViewMode: () => void;
}

interface UseEditActionsParams {
  setTagTree: React.Dispatch<React.SetStateAction<TagTree | null>>;
  setDraftError: React.Dispatch<React.SetStateAction<string>>;
  createTagMutation: ReturnType<typeof useCreateTag>;
  enterPreviewMode: () => void;
  setToast: React.Dispatch<React.SetStateAction<{ show: boolean; message: string; variant: 'success' | 'danger' }>>;
  intl: ReturnType<typeof useIntl>;
  setIsCreatingTopTag: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatingParentId: React.Dispatch<React.SetStateAction<RowId | null>>;
  exitDraftWithoutSave: () => void;
  setEditingRowId: React.Dispatch<React.SetStateAction<RowId | null>>;
  updateTagMutation: ReturnType<typeof useUpdateTag>;
}

const getInlineValidationMessage = (value: string, intl: ReturnType<typeof useIntl>): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return intl.formatMessage(messages.nameRequired);
  }
  if (!TAG_NAME_PATTERN.test(trimmed)) {
    return intl.formatMessage(messages.invalidCharacterInTagName);
  }
  return '';
};

const tableModeReducer = (currentMode: string, action: TableModeAction): string => {
  if (action?.type !== TABLE_MODE_ACTIONS.TRANSITION) {
    throw new Error(`Unknown table mode action: ${action?.type}`);
  }

  const { targetMode } = action;
  if (TRANSITION_TABLE[currentMode].includes(targetMode)) {
    return targetMode;
  }

  throw new Error(`Invalid table mode transition from ${currentMode} to ${targetMode}`);
};

const useTableModes = (): UseTableModesReturn => {
  const [tableMode, dispatchTableMode] = useReducer(tableModeReducer, TABLE_MODES.VIEW);

  const transitionTableMode = (targetMode: string) => {
    dispatchTableMode({ type: TABLE_MODE_ACTIONS.TRANSITION, targetMode });
  };

  const enterDraftMode = () => transitionTableMode(TABLE_MODES.DRAFT);
  const exitDraftWithoutSave = () => transitionTableMode(TABLE_MODES.PREVIEW);
  const enterPreviewMode = () => transitionTableMode(TABLE_MODES.PREVIEW);
  const enterViewMode = () => transitionTableMode(TABLE_MODES.VIEW);

  return {
    tableMode, enterDraftMode, exitDraftWithoutSave, enterPreviewMode, enterViewMode,
  };
};

const useEditActions = ({
  setTagTree,
  setDraftError,
  createTagMutation,
  enterPreviewMode,
  setToast,
  intl,
  setIsCreatingTopTag,
  setCreatingParentId,
  setEditingRowId,
  updateTagMutation,
}: UseEditActionsParams) => {
  const updateTableWithoutDataReload = (value: string, parentTagValue: string | null = null) => {
    setTagTree((currentTagTree) => {
      const nextTree = currentTagTree || new TagTree([]);
      const parentTag = parentTagValue ? nextTree.getTagAsDeepCopy(parentTagValue) : null;

      nextTree.addNode({
        id: Date.now(),
        value,
        parentValue: parentTagValue,
        depth: parentTag ? parentTag.depth + 1 : 0,
        childCount: 0,
        descendantCount: 0,
        subTagsUrl: null,
        externalId: null,
      }, parentTagValue);

      return nextTree;
    });
  };

  const validate = (value: string, mode: 'soft' | 'hard' = 'hard'): boolean => {
    const validationError = getInlineValidationMessage(value, intl);
    if (validationError) {
      if (mode === 'hard') {
        throw new Error(validationError);
      }
      setDraftError(validationError);
      return false;
    }

    setDraftError('');
    return true;
  };

  const handleCreateTag = async (value: string, parentTagValue?: string) => {
    const trimmed = value.trim();

    if (!validate(trimmed, 'soft')) {
      return;
    }

    try {
      setDraftError('');
      await createTagMutation.mutateAsync({ value: trimmed, parentTagValue });
      updateTableWithoutDataReload(trimmed, parentTagValue || null);
      enterPreviewMode();
      setToast({
        show: true,
        message: intl.formatMessage(messages.tagCreationSuccessMessage, { name: trimmed }),
        variant: 'success',
      });
      setIsCreatingTopTag(false);
      setCreatingParentId(null);
    } catch (error) {
      const message = intl.formatMessage(messages.tagCreationErrorMessage, { errorMessage: (error as Error)?.message });
      setDraftError((error as Error)?.message || intl.formatMessage(messages.tagCreationErrorMessage, { errorMessage: '' }));
      setToast({ show: true, message, variant: 'danger' });
    }
  };

  const handleUpdateTag = async (value: string, originalValue: string) => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== originalValue) {
      // enterPreviewMode();

      try {
        await updateTagMutation.mutateAsync({ value: trimmed, originalValue });
      } catch (error) {
        const message = intl.formatMessage(messages.tagUpdateErrorMessage, { errorMessage: (error as Error)?.message });
        setToast({ show: true, message, variant: 'danger' });
        return;
      }

      setToast({
        show: true,
        message: intl.formatMessage(messages.tagUpdateSuccessMessage, { name: trimmed }),
        variant: 'success',
      });
    }
    setEditingRowId(null);
  };

  return {
    updateTableWithoutDataReload,
    handleCreateTag,
    handleUpdateTag,
    validate,
  };
};

export { useTableModes, useEditActions };
