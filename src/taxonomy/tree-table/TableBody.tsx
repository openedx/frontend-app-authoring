import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { flexRender } from '@tanstack/react-table';

import SubRowsExpanded from './SubRowsExpanded';

import messages from '../tag-list/messages';

import EditableCell from './EditableCell';
import type {
  CreateRowMutationState,
  RowId,
  ToastState,
  TreeColumnDef,
  TreeTable,
} from './types';

interface TableBodyProps {
  columns: TreeColumnDef[];
  isCreatingTopRow: boolean;
  draftError: string;
  handleCreateTopRow: (value: string, setToast: React.Dispatch<React.SetStateAction<ToastState>>) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  exitDraftWithoutSave: () => void;
  handleCreateChildRow: (value: string, parentRowValue: string) => void;
  creatingParentId: RowId | null;
  setCreatingParentId: (id: RowId | null) => void;
  setDraftError: (error: string) => void;
  createRowMutation: CreateRowMutationState;
  table: TreeTable;
  setToast: React.Dispatch<React.SetStateAction<ToastState>>;
}

const TableBody = ({
  columns,
  isCreatingTopRow,
  draftError,
  handleCreateTopRow,
  setIsCreatingTopRow,
  exitDraftWithoutSave,
  handleCreateChildRow,
  creatingParentId,
  setCreatingParentId,
  setDraftError,
  createRowMutation,
  table,
  setToast,
}: TableBodyProps) => {
  const intl = useIntl();

  return (
    <tbody>
      {table.getRowModel().rows.length === 0 && (
        <tr>
          <td colSpan={columns.length} style={{ textAlign: 'center', padding: '1rem' }}>
            {intl.formatMessage(messages.noResultsFoundMessage)}
          </td>
        </tr>
      )}

      {isCreatingTopRow && (
        <tr id="creating-top-row" data-testid="creating-top-row">
          <td style={{ padding: '8px 8px 8px 0' }}>
            <EditableCell
              errorMessage={draftError}
              isSaving={createRowMutation.isPending}
              onSave={(value) => handleCreateTopRow(value, setToast)}
              onCancel={() => {
                setDraftError('');
                setIsCreatingTopRow(false);
                exitDraftWithoutSave();
              }}
            />
          </td>
        </tr>
      )}

      {table.getRowModel().rows.filter(row => row.depth === 0).map(row => (
        <React.Fragment key={row.id}>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            {row.getVisibleCells()
              .map(cell => (
                <td key={cell.id} style={{ padding: '8px' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
          </tr>

          {row.getIsExpanded() && (
            <SubRowsExpanded
              childRowsData={row.subRows}
              visibleColumnCount={row.getVisibleCells().length}
              parentRowValue={String(row.original.value)}
              isCreating={creatingParentId === row.original.id}
              onSaveNewChildRow={handleCreateChildRow}
              onCancelCreation={() => {
                setDraftError('');
                setCreatingParentId(null);
                exitDraftWithoutSave();
              }}
              creatingParentId={creatingParentId}
              setCreatingParentId={setCreatingParentId}
              depth={1}
              draftError={draftError}
              isSavingDraft={createRowMutation.isPending}
              setDraftError={setDraftError}
            />
          )}
        </React.Fragment>
      ))}
    </tbody>
  );
};

export default TableBody;