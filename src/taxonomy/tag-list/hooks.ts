import { useReducer } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useCreateTag } from '../data/apiHooks';
import { TagTree } from './tagTree';
import { TagListTableError } from './errors';
import type { RowId } from '../tree-table/types';
import {
  TABLE_MODES,
  TRANSITION_TABLE,
  TABLE_MODE_ACTIONS,
  TAG_NAME_PATTERN,
} from './constants';

import messages from './messages';

/** Interface for table mode actions for React's `useReducer` hook.
 *
 * `type`: Action type.
 * `targetMode`: The table mode to transition to. Must be one of the allowed transitions defined in `TRANSITION_TABLE`.
 * An invalid transition (e.g. from DRAFT to VIEW) will throw an error to prevent disruptive data refreshes.
 *
 * For examples, see: https://react.dev/learn/extracting-state-logic-into-a-reducer#writing-reducers-well
*/
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
  setToast: React.Dispatch<React.SetStateAction<{ show: boolean; message: string; }>>;
  setIsCreatingTopTag: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatingParentId: React.Dispatch<React.SetStateAction<RowId | null>>;
  exitDraftWithoutSave: () => void;
  setEditingRowId: React.Dispatch<React.SetStateAction<RowId | null>>;
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

/** Table mode reducer for React's `useReducer` hook.
 * This will throw an error if an invalid table mode transition is attempted,
 * as defined in the `TRANSITION_TABLE` constant.
 *
 * @param currentMode - The current table mode.
 * @param action - The action to perform on the table mode.
 * @returns The new table mode.
 */
const tableModeReducer = (currentMode: string, action: TableModeAction): string => {
  if (action?.type !== TABLE_MODE_ACTIONS.TRANSITION) {
    throw new TagListTableError(`Unknown table mode action: ${action?.type}`);
  }

  const { targetMode } = action;
  if (TRANSITION_TABLE[currentMode].includes(targetMode)) {
    return targetMode;
  }

  throw new TagListTableError(`Invalid table mode transition from ${currentMode} to ${targetMode}`);
};

/** Simple custom hook providing table modes.
 * The main purpose of this hook is to manage allowed transitions between table modes
 * to prevent disruptive data refreshes.
 * This allows a component to check the current mode and switch to a different mode without risking invalid transitions.
 * Transitions are defined separately in the `TRANSITION_TABLE` constant,
 * which makes it easy to understand and update allowed transitions in one place.
 */
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
  setIsCreatingTopTag,
  setCreatingParentId,
  setEditingRowId,
}: UseEditActionsParams) => {
  const intl = useIntl();
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

  /** Validates a tag value and sets a draft error message if invalid.
   * In 'hard' mode, it will throw an error instead of setting a draft error message;
   * in 'soft' mode, it will set a draft error message and return false.
   */
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
      });
      setIsCreatingTopTag(false);
      setCreatingParentId(null);
    } catch (error) {
      const message = intl.formatMessage(messages.tagCreationErrorMessage, { errorMessage: (error as Error)?.message });
      setDraftError((error as Error)?.message || intl.formatMessage(messages.tagCreationErrorMessage, { errorMessage: '' }));
      setToast({ show: true, message });
    }
  };

  const handleUpdateTag = async (value: string, originalValue: string) => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== originalValue) {
      enterPreviewMode();
      setToast({
        show: true,
        message: intl.formatMessage(messages.tagUpdateSuccessMessage, { name: trimmed }),
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
