import React, { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { flexRender } from '@tanstack/react-table';

import NestedRows from './NestedRows';

import messages from '../tag-list/messages';

import { EditableCell } from './EditableCell';
import type {
  CreateRowMutationState,
  RowId,
  ToastState,
  TreeColumnDef,
  TreeTable,
} from './types';
import { Button, Spinner } from '@openedx/paragon';

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
}: TableBodyProps) => {
  const intl = useIntl();

  const [newRowValue, setNewRowValue] = useState('');

  useEffect(() => {
    if (!isCreatingTopRow) {
      setNewRowValue('');
    }
  }, [isCreatingTopRow]);

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
          <td colSpan={1} style={{ padding: '8px 8px 8px 0' }}>
            <EditableCell
              errorMessage={draftError}
              isSaving={createRowMutation.isPending}
              onChange={(e) => {
                setNewRowValue(e.target.value);
              }}
            />
          </td>
          <td colSpan={columns.length - 1} style={{
            width: '150px',
            minWidth: '20px',
            maxWidth: '9.0072e+15px',
            padding: '8px',
            verticalAlign: 'top',
            overflowWrap: 'anywhere',
          }}>
            <span className="d-flex justify-content-end">
              <span className="mr-2">
                <Button variant="secondary" size="sm" onClick={() => {
                  setDraftError('');
                  setNewRowValue('');
                  setIsCreatingTopRow(false);
                  exitDraftWithoutSave();
                }}>
                  Cancel
                </Button>
              </span>
              <span className="mr-2">
                <Button variant="primary" size="sm" onClick={() => handleCreateRow(newRowValue)}>
                  Save
                </Button>
              </span>
              {createRowMutation.isPending && (
                <Spinner
                  animation="border"
                  role="status"
                  variant="primary"
                  size="sm"
                  screenReaderText="Saving..."
                />
              )}
            </span>
          </td>
        </tr>
      )}

      {table.getRowModel().rows.filter(row => row.depth === 0).map(row => (
        <React.Fragment key={row.id}>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            {row.getVisibleCells()
              .map(cell => (
                <td key={cell.id} style={{
                  width: cell.column.getSize(),
                  minWidth: cell.column.columnDef.minSize ?? cell.column.getSize(),
                  maxWidth: cell.column.columnDef.maxSize ?? cell.column.getSize(),
                  padding: '8px',
                  verticalAlign: 'top',
                  overflowWrap: 'anywhere',
                }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
          </tr>
          <NestedRows
            parentRow={row}
            childRowsData={row.subRows}
            visibleColumnCount={row.getVisibleCells().length}
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
            isSavingDraft={createRowMutation.isPending}
            setDraftError={setDraftError}
          />
        </React.Fragment>
      ))}
    </tbody>
  );
};

export default TableBody;
