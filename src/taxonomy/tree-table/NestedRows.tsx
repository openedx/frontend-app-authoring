import React from 'react';
import { flexRender } from '@tanstack/react-table';

import type {
  RowId,
  TreeRow,
  CreateRowMutationState,
} from './types';
import { CreateRow } from './CreateRow';

/**
 * Props for the NestedRows component
 * @interface NestedRowsProps
 * @property {TreeRow} parentRow - The parent row object from TanStack React Table
 * @property {string} parentRowValue - The value identifier of the parent row
 * @property {boolean} [isCreating] - Whether a new child row is currently being created for this parent
 * @property {function} [onSaveNewChildRow] - Callback when a new child row is saved (receives value and parentRowValue)
 * @property {function} [onCancelCreation] - Callback when child row creation is cancelled
 * @property {TreeRow[]} [childRowsData] - Array of child row objects to render
 * @property {number} [depth] - Current nesting depth level (used for indentation calculation)
 * @property {string} [draftError] - Error message to display in draft creation form
 * @property {function} [setDraftError] - Setter function for draft error state
 * @property {RowId | null} [creatingParentId] - ID of the row currently in creation mode
 * @property {function} [setCreatingParentId] - Setter function for which row is in creation mode
 * @property {function} setIsCreatingTopRow - Callback to set whether top-level row creation is active
 * @property {CreateRowMutationState} createRowMutation - State object for the row creation mutation
 * (isPending, isError, error)
 * @property {function} validate - Validation function for new row values
 * (receives value and optional 'soft' or 'hard' mode; in 'hard' mode an exception is thrown on validation failure)
 */

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
