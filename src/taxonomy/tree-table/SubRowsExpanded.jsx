import React from 'react';
import Proptypes from 'prop-types';
import { flexRender } from '@tanstack/react-table';

import EditableCell from './EditableCell';

const SubRowsExpanded = ({
  parentRowValue,
  isCreating,
  onSaveNewChildRow,
  onCancelCreation,
  childRowsData,
  visibleColumnCount,
  depth,
  draftError,
  isSavingDraft,
  setDraftError,
  creatingParentId,
  setCreatingParentId,
}) => {
  const columnCount = childRowsData?.[0]?.getVisibleCells?.().length || visibleColumnCount || 1;
  const paddingLeft = depth + 4; // Additional left padding for sub-rows

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
        const rowData = row.original || row; // Handle both raw and table row data
        return (
          <React.Fragment key={rowData.id}>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {row.getVisibleCells()
                .map(cell => (
                  <td key={cell.id} className={`p-2 pl-${paddingLeft}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
            </tr>
            <SubRowsExpanded
              childRowsData={row.subRows}
              visibleColumnCount={row.getVisibleCells().length}
              parentRowValue={row.original.value}
              parentRowId={row.original.id}
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

SubRowsExpanded.propTypes = {
  childRowsData: Proptypes.array.isRequired,
  visibleColumnCount: Proptypes.number,
  parentRowValue: Proptypes.string.isRequired,
  isCreating: Proptypes.bool,
  onSaveNewChildRow: Proptypes.func,
  onCancelCreation: Proptypes.func,
  creatingParentId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  setCreatingParentId: Proptypes.func,
  depth: Proptypes.number,
  draftError: Proptypes.string,
  isSavingDraft: Proptypes.bool,
  setDraftError: Proptypes.func,
};

export default SubRowsExpanded;
