import React, { useContext } from 'react';
import { flexRender } from '@tanstack/react-table';

import type { TreeRow } from './types';
import CreateRow from './CreateRow';
import EditRow from './EditRow';
import { TreeTableContext } from './TreeTableContext';

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
}: NestedRowsProps) => {
  const {
    creatingParentId,
    setCreatingParentId,
    handleUpdateRow,
    editingRowId,
    setEditingRowId,
    exitDraftWithoutSave,
  } = useContext(TreeTableContext);

  if (!parentRow.getIsExpanded()) {
    return null;
  }
  const indent = Math.max(depth, 1);

  return (
    <>
      {isCreating && (
        <CreateRow
          handleCreateRow={(value) => onSaveNewChildRow(value, parentRowValue)}
          exitDraftWithoutSave={onCancelCreation}
          indent={indent}
        />
      )}
      {childRowsData?.map(row => {
        const rowData = row.original || row;
        return (
          <React.Fragment key={String(rowData.id)}>
            {editingRowId === `${row.original.id}:${String(row.original.value)}` ?
              (
                <EditRow
                  initialValue={String(row.original.value)}
                  handleUpdateRow={(value) => handleUpdateRow(value, String(row.original.value))}
                  cancelEditRow={() => {
                    setEditingRowId(null);
                    exitDraftWithoutSave();
                  }}
                  indent={indent}
                  row={row}
                />
              ) :
              (
                <tr>
                  {row.getVisibleCells()
                    .map((cell, index) => {
                      const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                      const isFirstColumn = index === 0;

                      return (
                        <td
                          key={cell.id}
                          className="p-1 tree-table-overflow-anywhere"
                        >
                          {isFirstColumn ?
                            <div className={`tree-table-indent tree-table-indent-${indent}`}>{content}</div> :
                            content}
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
              onCancelCreation={() => {
                setCreatingParentId(null);
                onCancelCreation();
              }}
              depth={depth + 1}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default NestedRows;
