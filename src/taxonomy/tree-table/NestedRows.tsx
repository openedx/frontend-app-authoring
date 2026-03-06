import React from 'react';
import { flexRender } from '@tanstack/react-table';

import { EditableCell } from './EditableCell';
import type {
  RowId,
  TreeRow,
} from './types';
import { Create } from '@openedx/paragon/icons';
import { CreateRow } from './CreateRow';

interface NestedRowsProps {
  parentRow: TreeRow;
  parentRowValue: string;
  isCreating?: boolean;
  onSaveNewChildRow?: (value: string, parentRowValue: string) => void;
  onCancelCreation?: () => void;
  childRowsData?: TreeRow[];
  visibleColumnCount?: number;
  depth?: number;
  draftError?: string;
  isSavingDraft?: boolean;
  setDraftError?: (error: string) => void;
  creatingParentId?: RowId | null;
  setCreatingParentId?: (value: RowId | null) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
}

const NestedRows = ({
  parentRow,
  parentRowValue,
  isCreating = false,
  onSaveNewChildRow = () => {},
  onCancelCreation = () => {},
  childRowsData = [],
  visibleColumnCount,
  depth = 1,
  draftError = '',
  isSavingDraft = false,
  setDraftError = () => {},
  creatingParentId = null,
  setCreatingParentId = () => {},
  setIsCreatingTopRow,
}: NestedRowsProps) => {
  const columnCount = childRowsData?.[0]?.getVisibleCells?.().length || visibleColumnCount || 1;
  const indentPx = depth * 16;

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
          createRowMutation={{ isPending: isSavingDraft }}
          columns={[]}
        />
      )}
      {childRowsData?.map(row => {
        const rowData = row.original || row;
        return (
          <React.Fragment key={String(rowData.id)}>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {row.getVisibleCells()
                .map((cell, index) => {
                  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                  const isFirstColumn = index === 0;

                  return (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize ?? cell.column.getSize(),
                        maxWidth: cell.column.columnDef.maxSize ?? cell.column.getSize(),
                        padding: '8px',
                        verticalAlign: 'top',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {isFirstColumn ? (
                        <div style={{ paddingInlineStart: `${indentPx}px` }}>{content}</div>
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
              visibleColumnCount={row.getVisibleCells().length}
              parentRowValue={String(row.original.value)}
              isCreating={creatingParentId === row.original.id}
              onSaveNewChildRow={onSaveNewChildRow}
              onCancelCreation={() => setCreatingParentId(null)}
              creatingParentId={creatingParentId}
              setCreatingParentId={setCreatingParentId}
              depth={depth + 1}
              draftError={draftError}
              isSavingDraft={isSavingDraft}
              setDraftError={setDraftError}
              setIsCreatingTopRow={setIsCreatingTopRow}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default NestedRows;