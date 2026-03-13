import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { flexRender } from '@tanstack/react-table';

import { LoadingSpinner } from '@src/generic/Loading';
import NestedRows from './NestedRows';

import messages from './messages';

import type {
  CreateRowMutationState,
  RowId,
  TreeColumnDef,
  TreeTable,
} from './types';
import { CreateRow, EditRow } from './CreateRow';

interface TableBodyProps {
  columns: TreeColumnDef[];
  isCreatingTopRow: boolean;
  draftError: string;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  exitDraftWithoutSave: () => void;
  handleCreateRow: (value: string, parentRowValue?: string) => void;
  creatingParentId: RowId | null;
  setCreatingParentId: (id: RowId | null) => void;
  setDraftError: (error: string) => void;
  createRowMutation: CreateRowMutationState;
  updateRowMutation: CreateRowMutationState;
  table: TreeTable;
  isLoading: boolean;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
  handleUpdateRow: (value: string, originalValue: string) => void;
  editingRowId: RowId | null;
  setEditingRowId: (id: RowId | null) => void;
}

const TableBody = ({
  columns,
  isCreatingTopRow,
  draftError,
  handleCreateRow,
  setIsCreatingTopRow,
  exitDraftWithoutSave,
  creatingParentId,
  setCreatingParentId,
  setDraftError,
  createRowMutation,
  updateRowMutation,
  table,
  isLoading,
  validate,
  handleUpdateRow,
  editingRowId,
  setEditingRowId,
}: TableBodyProps) => {
  const intl = useIntl();

  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="text-center">
            <LoadingSpinner />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {table.getRowModel().rows.length === 0 && (
        <tr>
          <td colSpan={columns.length} className="text-center">
            {intl.formatMessage(messages.noResultsFoundMessage)}
          </td>
        </tr>
      )}

      {isCreatingTopRow && (
        <CreateRow
          draftError={draftError}
          setDraftError={setDraftError}
          handleCreateRow={handleCreateRow}
          setIsCreatingTopRow={setIsCreatingTopRow}
          exitDraftWithoutSave={exitDraftWithoutSave}
          createRowMutation={createRowMutation}
          columns={columns}
          validate={validate}
        />
      )}

      {table.getRowModel().rows.filter(row => row.depth === 0).map(row => (
        <React.Fragment key={row.id}>
          {editingRowId === `${row.original.id}:${String(row.original.value)}` ? (
            <EditRow
              draftError={draftError}
              setDraftError={setDraftError}
              initialValue={String(row.original.value)}
              handleUpdateRow={(value) => handleUpdateRow(value, String(row.original.value))}
              cancelEditRow={() => {
                setEditingRowId(null);
                exitDraftWithoutSave();
              }}
              updateRowMutation={updateRowMutation}
              columns={columns}
              validate={validate}
            />
          ) : (
            <tr>
              {row.getVisibleCells()
                .map((cell, index) => (
                  <td key={cell.id} className={`p-1 ${index === 0 ? '' : 'tree-table-actions-column'}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
            </tr>
          )}
          <NestedRows
            parentRow={row}
            childRowsData={row.subRows}
            parentRowValue={String(row.original.value)}
            isCreating={creatingParentId === row.original.id}
            onSaveNewChildRow={handleCreateRow}
            onCancelCreation={() => {
              setDraftError('');
              setCreatingParentId(null);
              exitDraftWithoutSave();
            }}
            creatingParentId={creatingParentId}
            setCreatingParentId={setCreatingParentId}
            depth={1}
            draftError={draftError}
            createRowMutation={createRowMutation}
            setDraftError={setDraftError}
            setIsCreatingTopRow={setIsCreatingTopRow}
            validate={validate}
            updateRowMutation={updateRowMutation}
            handleUpdateRow={handleUpdateRow}
            editingRowId={editingRowId}
            setEditingRowId={setEditingRowId}
            exitDraftWithoutSave={exitDraftWithoutSave}
            columns={columns}
          />
        </React.Fragment>
      ))}
    </tbody>
  );
};

export default TableBody;
