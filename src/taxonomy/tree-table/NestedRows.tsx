import React from 'react';
import { flexRender } from '@tanstack/react-table';

import type {
  RowId,
  TreeRow,
  CreateRowMutationState,
} from './types';
import { CreateRow } from './CreateRow';

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
}: NestedRowsProps) => {
  if (!parentRow.getIsExpanded()) {
    return null;
  }
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
        />
      )}
      {childRowsData?.map(row => {
        const rowData = row.original || row;
        return (
          <React.Fragment key={String(rowData.id)}>
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
                        <div className={`tree-table-indent tree-table-indent-${Math.min(depth, 10)}`}>{content}</div>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
            </tr>
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
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default NestedRows;
