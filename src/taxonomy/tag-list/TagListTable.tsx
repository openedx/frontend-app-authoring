import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import { Button } from '@openedx/paragon';
import type { PaginationState, Row } from '@tanstack/react-table';
import { TableView } from '@src/taxonomy/tree-table';
import { useTagListData, useCreateTag, useUpdateTag } from '@src/taxonomy/data/apiHooks';
import { TagTree } from './tagTree';
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
import DeleteModal from './DeleteModal';
import { getTagListRowData } from './utils';

interface TagListTableProps {
  taxonomyId: number;
  maxDepth: number;
}

// TODO: Fix and enable pagination on backend and frontend.For now, disable pagination by showing all tags on one page.
const DISABLE_PAGINATION = true;

const TagListTable = ({ taxonomyId, maxDepth }: TagListTableProps) => {
  // The table has a VIEW, DRAFT, and a PREVIEW mode. It starts in VIEW mode.
  // It switches to DRAFT mode when a user edits or creates a tag.
  // It switches to PREVIEW mode after saving changes, and only switches to VIEW when
  // the user refreshes the page, orders a column, or navigates to a different page.
  // During DRAFT and PREVIEW mode the table makes POST requests and receives
  // success or failure responses.
  // However, the table does not refresh to show the updated data from the backend.
  // This allows us to show the newly created or updated tag in the same place without reordering.
  //
  // TODO: Simpler approaches have been suggested. Two options are to just use simple React state:
  // `isCurrentlyEditingTag` and `lastCreatedTag`, or to use optimistic updates.
  // For reference, see https://github.com/openedx/frontend-app-authoring/pull/2872#discussion_r2880965005.

  const [creatingParentId, setCreatingParentId] = useState<RowId | null>(null);
  const [editingRowId, setEditingRowId] = useState<RowId | null>(null);

  // TODO: change to use the global ToastContext (waiting for UX refinement on that).
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [tagTree, setTagTree] = useState<TagTree | null>(null);
  const [isCreatingTopTag, setIsCreatingTopTag] = useState(false);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState<RowId | null>(null);
  const [draftError, setDraftError] = useState('');
  const treeData = (tagTree?.getAllAsDeepCopy() || []) as unknown as TreeRowData[];
  const hasOpenDraft = isCreatingTopTag || creatingParentId !== null || editingRowId !== null;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalRow, setDeleteModalRow] = useState<Row<TreeRowData> | null>(null);

  // TABLE MODES
  const {
    tableMode,
    enterDraftMode,
    exitDraftWithoutSave,
    enterPreviewMode,
    enterViewMode,
  } = useTableModes();

  // PAGINATION
  // TODO: Fix and enable pagination. For now, disable pagination.
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);
  const handlePaginationChange = (updater: React.SetStateAction<PaginationState>) => {
    if (tableMode === TABLE_MODES.PREVIEW) {
      enterViewMode();
    }
    setPagination(updater);
  };

  // API HOOKS
  const { isLoading, data: tagList } = useTagListData(taxonomyId, {
    ...pagination,
    disablePagination: DISABLE_PAGINATION,
    enabled: tableMode === TABLE_MODES.VIEW,
  });
  const createTagMutation = useCreateTag(taxonomyId);
  const updateTagMutation = useUpdateTag(taxonomyId);
  const pageCount = tagList?.numPages ?? -1;

  // TODO: to make this more readable, introduce a React context for the TagListTable instead of passing props.

  // Custom Edit Actions Hook - handles table mode transitions, API calls,
  // and updating the table without a full data reload when creating or editing tags.
  const { handleCreateTag, handleUpdateTag, validate } = useEditActions({
    setTagTree,
    setDraftError,
    createTagMutation,
    updateTagMutation,
    enterPreviewMode,
    setToast,
    setIsCreatingTopTag,
    setCreatingParentId,
    exitDraftWithoutSave,
    setEditingRowId,
  });

  const columns = useMemo<TreeColumnDef[]>(
    () =>
      getColumns({
        setIsCreatingTopTag,
        setCreatingParentId,
        handleUpdateTag,
        setEditingRowId,
        onStartDraft: enterDraftMode,
        setActiveActionMenuRowId,
        hasOpenDraft,
        canAddTag: tagList?.canAddTag !== false,
        draftError,
        setDraftError,
        isSavingDraft: createTagMutation.isPending,
        maxDepth,
      }),
    [
      isCreatingTopTag,
      tableMode,
      activeActionMenuRowId,
      hasOpenDraft,
      creatingParentId,
      tagList?.canAddTag,
      draftError,
      createTagMutation.isPending,
      maxDepth,
      setIsCreatingTopTag,
      setCreatingParentId,
      handleUpdateTag,
      setEditingRowId,
      enterDraftMode,
      setActiveActionMenuRowId,
      setDraftError,
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

  // TODO: remove after testing
  const openDeleteModalTest = () => {
    const firstRow = treeData[0];

    if (!firstRow) {
      return;
    }

    setDeleteModalRow({
      id: String(firstRow.id),
      original: firstRow,
    } as Row<TreeRowData>);
    setIsDeleteModalOpen(true);
  };

  // TODO: remove after testing
  const handleDeleteModalConfirm = (row: Row<TreeRowData>) => {
    const rowData = getTagListRowData(row);

    setToast({
      show: true,
      message: `Delete modal confirmed for "${rowData.value}" (test only).`,
      variant: 'success',
    });
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        {/* TODO: remove after testing */}
        <Button
          variant="outline-primary"
          size="sm"
          onClick={openDeleteModalTest}
          disabled={!treeData.length}
        >
          Test Delete Modal
        </Button>
      </div>
      <TableView
        {...{
          treeData,
          columns,
          pageCount,
          pagination,
          handlePaginationChange,
          isLoading,
          isCreatingTopRow: isCreatingTopTag,
          draftError,
          createRowMutation: createTagMutation,
          updateRowMutation: updateTagMutation,
          handleCreateRow: handleCreateTag,
          handleUpdateRow: handleUpdateTag,
          toast,
          setToast,
          setIsCreatingTopRow: setIsCreatingTopTag,
          exitDraftWithoutSave,
          creatingParentId,
          setCreatingParentId,
          setDraftError,
          validate,
          editingRowId,
          setEditingRowId,
        }}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        row={deleteModalRow}
        setIsOpen={setIsDeleteModalOpen}
        setRow={setDeleteModalRow}
        handleDeleteRow={handleDeleteModalConfirm}
      />
    </>
  );
};

export default TagListTable;
