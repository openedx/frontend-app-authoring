import { useReducer } from 'react';
import { AxiosError } from 'axios';
import { useIntl } from '@edx/frontend-platform/i18n';

import globalMessages from '@src/messages';
import { useCreateTag, useDeleteTag, useUpdateTag } from '@src/taxonomy/data/apiHooks';
import type { RowId, TreeRowData } from '@src/taxonomy/tree-table/types';
import { TagTree } from './tagTree';
import { TagListTableError } from './errors';
import {
  TABLE_MODES,
  TRANSITION_TABLE,
  TABLE_MODE_ACTIONS,
  TAG_NAME_PATTERN,
} from './constants';

import messages from './messages';
import { getTagListRowData, getTagWithDescendantsCount } from './utils';
import { Row } from '@tanstack/react-table';

const DELETE_CONFIRM_MESSAGE =
  'Warning: are you sure you want to delete this tag and all its subtags and descendants? Any tags applied to course content will be deleted.';

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
  enterDraftMode: () => void;
  enterPreviewMode: () => void;
  enterViewMode: () => void;
  setToast: React.Dispatch<React.SetStateAction<{ show: boolean; message: string; }>>;
  setIsCreatingTopTag: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatingParentId: React.Dispatch<React.SetStateAction<RowId | null>>;
  exitDraftWithoutSave: () => void;
  setEditingRowId: React.Dispatch<React.SetStateAction<RowId | null>>;
  updateTagMutation: ReturnType<typeof useUpdateTag>;
  setActiveActionMenuRowId: React.Dispatch<React.SetStateAction<RowId | null>>;
  deleteTagMutation: ReturnType<typeof useDeleteTag>;
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
    tableMode,
    enterDraftMode,
    exitDraftWithoutSave,
    enterPreviewMode,
    enterViewMode,
  };
};

const useEditActions = ({
  enterDraftMode,
  enterPreviewMode,
  enterViewMode,
  setTagTree,
  setDraftError,
  createTagMutation,
  setToast,
  setIsCreatingTopTag,
  setCreatingParentId,
  exitDraftWithoutSave,
  setEditingRowId,
  updateTagMutation,
  deleteTagMutation,
}: UseEditActionsParams) => {
  const intl = useIntl();

  const updateTableAfterRename = (oldValue: string, newValue: string) => {
    setTagTree((currentTagTree) => {
      const nextTree = currentTagTree || new TagTree([]);
      nextTree.editTagValue(oldValue, newValue);
      return nextTree;
    });
  };

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
        subTagsUrl: null,
        externalId: '',
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

  const formatErrorMessage = (errorMessage: string): string => {
    // Remove trailing period for better message formatting
    return errorMessage.replace(/\.$/, '');
  };

  const getAxiosErrorMessage = (axiosError: AxiosError) => {
    const responseData = axiosError.response?.data;
    const tagError = responseData ?
      Object.entries(responseData)?.find((errItem: [string, unknown]) => (
        ['tag', 'value', 'updated_tag_value'].includes(errItem[0].toLowerCase())
      )) :
      null;

    const errorMessages = tagError ? tagError[1] : (
      axiosError.message || intl.formatMessage(globalMessages.unknownError)
    );
    const errorMessage = Array.isArray(errorMessages) ? errorMessages.join('; ') : String(errorMessages);
    return formatErrorMessage(errorMessage);
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      return getAxiosErrorMessage(error);
    }

    if (error instanceof Error && error.message) {
      return formatErrorMessage(error.message);
    }

    return intl.formatMessage(globalMessages.unknownError);
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
      const errorMessage = getErrorMessage(error);
      setDraftError(errorMessage);
      setToast({ show: true, message: intl.formatMessage(messages.tagCreationErrorMessage, { errorMessage }) });
    }
  };

  const handleUpdateTag = async (value: string, originalValue: string) => {
    const trimmed = value.trim();
    if (!validate(trimmed, 'soft')) {
      return;
    }

    if (trimmed === originalValue) {
      setEditingRowId(null);
      exitDraftWithoutSave();
      return;
    }

    try {
      setDraftError('');
      await updateTagMutation.mutateAsync({ value: trimmed, originalValue });
      updateTableAfterRename(originalValue, trimmed);
      enterPreviewMode();
      setEditingRowId(null);
      setToast({
        show: true,
        message: intl.formatMessage(messages.tagUpdateSuccessMessage, { name: trimmed }),
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setDraftError(errorMessage);
      setToast({ show: true, message: intl.formatMessage(messages.tagUpdateErrorMessage, { errorMessage }) });
    }
  };

  const startSubtagDraft = (row: Row<TreeRowData>) => {
    const rowData = getTagListRowData(row);
    enterDraftMode();
    setDraftError('');
    setCreatingParentId(rowData.id);
    row.toggleExpanded(true);
  };

  const startEditTag = (row: Row<TreeRowData>) => {
    const rowData = getTagListRowData(row);
    enterDraftMode();
    setDraftError('');
    setEditingRowId(`${rowData.id}:${rowData.value}`);
  };

  const startDeleteTag = (row: Row<TreeRowData>) => {
    if (window.confirm(DELETE_CONFIRM_MESSAGE)) {
      void handleDeleteTag(row);
    }
  };

  const handleDeleteTag = async (row: Row<TreeRowData>) => {
    const rowData = getTagListRowData(row);
    const count = getTagWithDescendantsCount(rowData);
    // Only request recursive deletion when the frontend has loaded descendants.
    // If this state is stale and the backend finds subtags while with_subtags is false,
    // the backend rejects the request instead of deleting the parent alone.
    const shouldDeleteSubtags = count > 1;
    try {
      // In view mode, the table reloads on change, reflecting the deletion
      // without needing to manually update the table state
      enterViewMode();
      await deleteTagMutation.mutateAsync({ value: rowData.value, withSubtags: shouldDeleteSubtags });
      setToast({
        show: true,
        message: intl.formatMessage(messages.tagsDeleteSuccessMessage, { count }),
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setDraftError(errorMessage);
      setToast({ show: true, message: intl.formatMessage(messages.tagDeleteErrorMessage, { errorMessage }) });
    }
  };

  return {
    updateTableWithoutDataReload,
    handleCreateRow: handleCreateTag,
    handleUpdateRow: handleUpdateTag,
    startSubtagDraft,
    startEditRow: startEditTag,
    startDeleteRow: startDeleteTag,
    validate,
  };
};

export { useTableModes, useEditActions };
