import React from 'react';
import { flexRender } from '@tanstack/react-table';

import type {
  RowId,
  TreeRow,
  TreeColumnDef,
  CreateRowMutationState,
} from './types';
import { CreateRow, EditRow } from './CreateRow';

interface NestedRowsProps {
  parentRow: TreeRow;
  parentRowValue: string;
  isCreating?: boolean;
  onSaveNewChildRow?: (value: string, parentRowValue: string) => void;
  onCancelCreation?: () => void;
  childRowsData?: TreeRow[];
  depth?: number;
  draftError?: string;
  setDraftError?: (error: string) => void;
  creatingParentId?: RowId | null;
  setCreatingParentId?: (value: RowId | null) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  createRowMutation: CreateRowMutationState;
  updateRowMutation: CreateRowMutationState;
  handleUpdateRow: (value: string, originalValue: string) => void;
  editingRowId: RowId | null;
  setEditingRowId: (id: RowId | null) => void;
  exitDraftWithoutSave: () => void;
  columns?: TreeColumnDef[];
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
}

const NestedRows = ({
  parentRow,
  parentRowValue,
  isCreating = false,
  onSaveNewChildRow = () => {},
  onCancelCreation = () => {},
  childRowsData = [],
  depth = 1,
  draftError = '',
  setDraftError = () => {},
  creatingParentId = null,
  setCreatingParentId = () => {},
  setIsCreatingTopRow,
  createRowMutation,
  updateRowMutation,
  handleUpdateRow,
  editingRowId,
  setEditingRowId,
  exitDraftWithoutSave,
  columns = [],
  validate,
}: NestedRowsProps) => {
  if (!parentRow.getIsExpanded()) {
    return null;
  }
  const indent = Math.max(depth, 1);

  return (
    <>
      {isCreating && (
        <CreateRow
          draftError={draftError}
          setDraftError={setDraftError}
          handleCreateRow={(value) => onSaveNewChildRow(value, parentRowValue)}
          setIsCreatingTopRow={setIsCreatingTopRow}
          exitDraftWithoutSave={onCancelCreation}
          createRowMutation={createRowMutation}
          columns={[]}
          indent={indent}
          validate={validate}
        />
      )}
      {childRowsData?.map(row => {
        const rowData = row.original || row;
        return (
          <React.Fragment key={String(rowData.id)}>
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
                indent={indent}
                validate={validate}
              />
            ) : (
              <tr>
                {row.getVisibleCells()
                  .map((cell, index) => {
                    const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                    const isFirstColumn = index === 0;

                    return (
                      <td
                        key={cell.id}
                        className={`p-1 align-top tree-table-overflow-anywhere ${isFirstColumn ? '' : 'tree-table-actions-column'}`}
                      >
                        {isFirstColumn ? (
                          <div className={`tree-table-indent tree-table-indent-${indent}`}>{content}</div>
                        ) : (
                          content
                        )}
                      </td>
                    );
                  })}
              </tr>
            )}
            <NestedRows
              parentRow={row}
              childRowsData={row.subRows as TreeRow[]}
              parentRowValue={String(row.original.value)}
              isCreating={creatingParentId === row.original.id}
              onSaveNewChildRow={onSaveNewChildRow}
              onCancelCreation={
                () => {
                  setCreatingParentId(null);
                  onCancelCreation();
                }
              }
              creatingParentId={creatingParentId}
              setCreatingParentId={setCreatingParentId}
              depth={depth + 1}
              draftError={draftError}
              setDraftError={setDraftError}
              setIsCreatingTopRow={setIsCreatingTopRow}
              createRowMutation={createRowMutation}
              updateRowMutation={updateRowMutation}
              handleUpdateRow={handleUpdateRow}
              editingRowId={editingRowId}
              setEditingRowId={setEditingRowId}
              exitDraftWithoutSave={exitDraftWithoutSave}
              columns={columns}
              validate={validate}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default NestedRows;
