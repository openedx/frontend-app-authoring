import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { flexRender } from '@tanstack/react-table';
import type { Cell } from '@tanstack/react-table';

import { LoadingSpinner } from '@src/generic/Loading';
import NestedRows from './NestedRows';

import messages from './messages';

import type {
  CreateRowMutationState,
  RowId,
  TreeColumnDef,
  TreeRowData,
  TreeTable,
} from './types';
import { CreateRow } from './CreateRow';
import { EditableCell } from './EditableCell';

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
  table: TreeTable;
  isLoading: boolean;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
  editingRowId: RowId | null;
  editableColumns: string[];
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
  table,
  isLoading,
  validate,
  editingRowId,
  editableColumns,
}: TableBodyProps) => {
  const intl = useIntl();
  const isCellEditable = (rowId: RowId | null, cell: Cell<TreeRowData, unknown>) => {
    console.log('cell column id:', cell.column.id);
    return (
      rowId === editingRowId && editableColumns.includes(cell.column.id)
    )};
  console.log('editableColumns in TableBody:', editableColumns);

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
          <tr>
            {row.getVisibleCells()
              .map((cell, index) => (
                <td key={cell.id} className={`p-1 ${index === 0 ? '' : 'tree-table-actions-column'}`}>
                  {isCellEditable(row.original.id, cell) ? (
                    <EditableCell
                      initialValue={String(cell.getValue())}
                      autoFocus
                    />
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </td>
              ))}
          </tr>
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
          />
        </React.Fragment>
      ))}
    </tbody>
  );
};

export default TableBody;
