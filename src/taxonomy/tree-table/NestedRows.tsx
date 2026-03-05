import React from 'react';
import { flexRender } from '@tanstack/react-table';

import { EditableCell } from './EditableCell';
import type {
  RowId,
  TreeRow,
} from './types';

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
}: NestedRowsProps) => {
  const columnCount = childRowsData?.[0]?.getVisibleCells?.().length || visibleColumnCount || 1;
  const indentPx = depth * 16;

  if (!parentRow.getIsExpanded()) {
    return null;
  }
  return (
    <>
      {isCreating && (
        <tr>
          <td colSpan={columnCount} style={{ padding: '8px 8px 8px 0' }}>
            <div style={{ paddingInlineStart: `${indentPx}px`, maxWidth: '100%' }}>
            <EditableCell
              errorMessage={draftError}
              isSaving={isSavingDraft}
              onSave={(val) => onSaveNewChildRow(val, parentRowValue)}
              onCancel={() => {
                setDraftError('');
                onCancelCreation();
              }}
              getInlineValidationMessage={(value) => {
                if (!value.trim()) {
                  return 'Name cannot be empty.';
                }
                return '';
              }}
            />
            </div>
          </td>
        </tr>
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
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default NestedRows;