import React from 'react';
import { flexRender } from '@tanstack/react-table';

import { EditableCell } from './EditableCell';
import type {
  RowId,
  TreeRow,
} from './types';

interface NestedRowsProps {
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
  const paddingLeft = depth + 4;

  return (
    <>
      {isCreating && (
        <tr>
          <td colSpan={columnCount} className={`p-2 pl-${paddingLeft}`}>
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
          </td>
        </tr>
      )}
      {childRowsData?.map(row => {
        const rowData = row.original || row;
        return (
          <React.Fragment key={String(rowData.id)}>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {row.getVisibleCells()
                .map(cell => (
                  <td key={cell.id} className={`p-2 pl-${paddingLeft}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
            </tr>
            <NestedRows
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