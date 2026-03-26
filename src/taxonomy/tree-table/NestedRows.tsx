import React from 'react';
import { flexRender } from '@tanstack/react-table';

import type {
  RowId,
  TreeRow,
  CreateRowMutationState,
} from './types';
import { CreateRow } from './CreateRow';

interface NestedRowsProps {
  /** The parent row object from TanStack React Table */
  parentRow: TreeRow;
  /** The value identifier of the parent row */
  parentRowValue: string;
  /** Whether a new child row is currently being created for this parent */
  isCreating?: boolean;
  /** Callback when a new child row is saved (receives value and parentRowValue) */
  onSaveNewChildRow?: (value: string, parentRowValue: string) => void;
  /** Callback when child row creation is cancelled */
  onCancelCreation?: () => void;
  /** Array of child row objects to render */
  childRowsData?: TreeRow[];
  /** Current nesting depth level (used for indentation calculation) */
  depth?: number;
  /** Error message to display in draft creation form */
  draftError?: string;
  /** Setter function for draft error state */
  setDraftError?: (error: string) => void;
  /** ID of the row currently in creation mode */
  creatingParentId?: RowId | null;
  /** Setter function for which row is in creation mode */
  setCreatingParentId?: (value: RowId | null) => void;
  /** Callback to set whether top-level row creation is active */
  setIsCreatingTopRow: (isCreating: boolean) => void;
  /** State object for the row creation mutation (isPending, isError, error) */
  createRowMutation: CreateRowMutationState;
  /** Validation function for new row values (receives value and optional 'soft' or 'hard' mode;
   * in 'hard' mode an exception is thrown on validation failure) */
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
}

/**
 * NestedRows
 *
 * Recursively renders nested child rows within a tree table structure. This component handles:
 * - Display of child rows when a parent row is expanded
 * - Indentation based on nesting depth
 * - Creation of new child rows with validation
 * - Management of draft state during row creation
 * - Recursive rendering of grandchild rows and deeper levels
 *
 * The component uses the TanStack React Table library to render table cells and manages
 * the creation flow by displaying a CreateRow form when a parent is in creation mode.
 */
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
              validate={validate}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default NestedRows;
