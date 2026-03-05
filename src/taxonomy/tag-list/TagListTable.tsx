import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { PaginationState, TableMeta } from '@tanstack/react-table';
import { useTagListData, useCreateTag } from '../data/apiHooks';
import { TagTree } from './tagTree';
import { TableView } from '../tree-table';
import type {
  RowId,
  TreeColumnDef,
  TreeRowData,
} from '../tree-table/types';
import {
  TABLE_MODES,
} from './constants';
import { getColumns } from './tagColumns';
import { useTableModes, useEditActions } from './hooks';

interface TagListTableProps {
  taxonomyId: number;
  maxDepth: number;
}

export interface TableModeAction {
  type: string;
  targetMode: string;
}

const TagListTable = ({ taxonomyId, maxDepth }: TagListTableProps) => {
  // The table has a VIEW, DRAFT, and a PREVIEW mode. It starts in VIEW mode.
  // It switches to DRAFT mode when a user edits or creates a tag.
  // It switches to PREVIEW mode after saving changes, and only switches to VIEW when
  // the user refreshes the page, orders a column, or navigates to a different page.
  // During DRAFT and PREVIEW mode the table makes POST requests and receives
  // success or failure responses.
  // However, the table does not refresh to show the updated data from the backend.
  // This allows us to show the newly created or updated tag in the same place without reordering.
  const intl = useIntl();

  const [creatingParentId, setCreatingParentId] = useState<RowId | null>(null);
  const [editingRowId, setEditingRowId] = useState<RowId | null>(null);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [tagTree, setTagTree] = useState<TagTree | null>(null);
  const [isCreatingTopTag, setIsCreatingTopTag] = useState(false);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState<RowId | null>(null);
  const [draftError, setDraftError] = useState('');
  const [draftRowData, setDraftRowData] = useState<TreeRowData | null>(null);
  const treeData = (tagTree?.getAllAsDeepCopy() || []) as unknown as TreeRowData[];
  const hasOpenDraft = isCreatingTopTag || creatingParentId !== null || editingRowId !== null;

  const meta: TableMeta<TreeRowData> = {
    updateData: (rowId, columnId, value) => {
      setDraftRowData((prev) => {
        if (!prev) return prev;
        if (prev.id !== rowId) return prev;
        return {
          ...prev,
          [columnId]: value,
        };
      });
    },
    saveRow: (rowId: string | number, parentTagValue?: string) => {
      if (!draftRowData) return;
      // TODO: handle error / prevent this from happening
      if (draftRowData.id !== rowId) throw new Error('Mismatching rowId on saveRow');
      if (!parentTagValue) {
        handleCreateTag(draftRowData.value);
      } else if (creatingParentId && parentTagValue) {
        handleCreateTag(draftRowData.value, parentTagValue);
      } else if (editingRowId) {
        // TODO: implement
      }
    },
  };

  // PAGINATION
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);
  const handlePaginationChange = (updater: React.SetStateAction<PaginationState>) => {
    if (tableMode === TABLE_MODES.PREVIEW) {
      enterViewMode();
    }
    setPagination(updater);
  };

  // TABLE MODES
  const { tableMode, enterDraftMode, exitDraftWithoutSave, enterPreviewMode, enterViewMode } = useTableModes();

  // API HOOKS
  const { isLoading, data: tagList } = useTagListData(taxonomyId, {
    ...pagination,
    enabled: tableMode === TABLE_MODES.VIEW,
  });
  const createTagMutation = useCreateTag(taxonomyId);
  const pageCount = tagList?.numPages ?? -1;

  // Custom Edit Actions Hook - handles table mode transitions, API calls,
  // and updating the table without a full data reload when creating or editing tags.
  const { handleCreateTag, handleUpdateTag } = useEditActions({
    setTagTree,
    setDraftError,
    createTagMutation,
    enterPreviewMode,
    setToast,
    intl,
    setIsCreatingTopTag,
    setCreatingParentId,
    exitDraftWithoutSave,
    setEditingRowId,
  });

  const columns = useMemo<TreeColumnDef[]>(
    () => getColumns({
      intl,
      handleCreateTag,
      setIsCreatingTopTag,
      setCreatingParentId,
      handleUpdateTag,
      setEditingRowId,
      onStartDraft: enterDraftMode,
      activeActionMenuRowId,
      setActiveActionMenuRowId,
      hasOpenDraft,
      draftError,
      setDraftError,
      isSavingDraft: createTagMutation.isPending,
      maxDepth,
      creatingParentId,
    }),
    [
      intl,
      isCreatingTopTag,
      editingRowId,
      tableMode,
      activeActionMenuRowId,
      hasOpenDraft,
      creatingParentId,
      draftError,
      createTagMutation.isPending,
      maxDepth,
    ],
  );

  // RELOAD DATA IN VIEW MODE
  useEffect(() => {
    // Get row data in VIEW mode. Otherwise keep current data to avoid disrupting
    // users while they edit or create a tag.
    if (tableMode === TABLE_MODES.VIEW && tagList?.results) {
      const tree = new TagTree(tagList?.results);
      if (tree) {
        setTagTree(tree);
      }
    }
  }, [tagList?.results, tableMode]);

  return (
    <TableView
      {...{
        meta,
        maxDepth,
        treeData,
        columns,
        pageCount,
        pagination,
        handlePaginationChange,
        isLoading,
        isCreatingTopRow: isCreatingTopTag,
        draftError,
        createRowMutation: createTagMutation,
        handleCreateRow: handleCreateTag,
        toast,
        setToast,
        setIsCreatingTopRow: setIsCreatingTopTag,
        exitDraftWithoutSave,
        creatingParentId,
        setCreatingParentId,
        editingRowId,
        setEditingRowId,
        setDraftError,
        enterDraftMode,
      }}
    />
  );
};

export default TagListTable;
