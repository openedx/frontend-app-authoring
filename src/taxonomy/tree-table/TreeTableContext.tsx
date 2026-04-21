import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { OnChangeFn, PaginationState, Row } from '@tanstack/react-table';

import type {
  CreateRowMutationState,
  RowId,
  ToastState,
  TreeColumnDef,
  TreeRowData,
} from './types';

export interface TreeTableContextValue {
  treeData: TreeRowData[];
  columns: TreeColumnDef[];
  pageCount: number;
  pagination: PaginationState;
  handlePaginationChange: OnChangeFn<PaginationState>;
  isLoading: boolean;
  isCreatingTopRow: boolean;
  draftError: string;
  createRowMutation: CreateRowMutationState;
  updateRowMutation: CreateRowMutationState;
  toast: ToastState;
  setToast: Dispatch<SetStateAction<ToastState>>;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  exitDraftWithoutSave: () => void;
  handleCreateRow: (value: string, parentRowValue?: string) => void;
  creatingParentId: RowId | null;
  setCreatingParentId: (id: RowId | null) => void;
  setDraftError: (error: string) => void;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
  handleUpdateRow: (value: string, originalValue: string) => void;
  editingRowId: RowId | null;
  setEditingRowId: (id: RowId | null) => void;
  confirmDeleteDialogOpen: boolean;
  setConfirmDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
  confirmDeleteDialogContext: Row<TreeRowData> | null;
  setConfirmDeleteDialogContext: Dispatch<SetStateAction<Row<TreeRowData> | null>>;
  handleDeleteRow: (row: Row<TreeRowData>) => void;
  startEditRow: (row: Row<TreeRowData>) => void;
  startDeleteRow: (row: Row<TreeRowData>) => void;
}

export const TreeTableContext = createContext<TreeTableContextValue>({
  treeData: [],
  columns: [],
  pageCount: -1,
  pagination: { pageIndex: 0, pageSize: 0 },
  handlePaginationChange: () => {},
  isLoading: false,
  isCreatingTopRow: false,
  draftError: '',
  createRowMutation: {},
  updateRowMutation: {},
  toast: { show: false, message: '', variant: 'success' },
  setToast: () => {},
  setIsCreatingTopRow: () => {},
  exitDraftWithoutSave: () => {},
  handleCreateRow: () => {},
  creatingParentId: null,
  setCreatingParentId: () => {},
  setDraftError: () => {},
  validate: () => true,
  handleUpdateRow: () => {},
  editingRowId: null,
  setEditingRowId: () => {},
  confirmDeleteDialogOpen: false,
  setConfirmDeleteDialogOpen: () => {},
  confirmDeleteDialogContext: null,
  setConfirmDeleteDialogContext: () => {},
  handleDeleteRow: () => {},
  startEditRow: () => {},
  startDeleteRow: () => {},
});
