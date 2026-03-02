import React from 'react';
import Proptypes from 'prop-types';
import { flexRender } from '@tanstack/react-table';

import EditableCell from './EditableCell';

const SubTagsExpanded = ({
  parentRowValue,
  isCreating,
  onSaveNewChildRow,
  onCancelCreation,
  childRowsData,
  visibleColumnCount,
  createRowMutation,
  creatingParentId,
  editingRowId,
  setCreatingParentId,
  setEditingRowId,
  maxDepth,
  draftError,
  isSavingDraft,
  onStartDraft,
  setIsCreatingTopRow,
  setDraftError,
}) => {
  const columnCount = childRowsData?.[0]?.getVisibleCells?.().length || visibleColumnCount || 1;

  return (
    <>
      {isCreating && (
        <tr>
          <td colSpan={columnCount} style={{ padding: '8px 8px 8px 0' }}>
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
                  <td key={cell.id} style={{ padding: '8px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
            </tr>

            <tr style={{ backgroundColor: '#f9f9f9' }}>
              {/* colSpan stretches the sub-row across the whole table */}
              <td colSpan={row.getVisibleCells().length} style={{ padding: '8px 8px 8px 24px' }}>
                <SubTagsExpanded
                  childRowsData={row.subRows}
                  visibleColumnCount={row.getVisibleCells().length}
                  parentRowValue={row.original.value}
                  parentRowId={row.original.id}
                  isCreating={creatingParentId === row.original.id}
                  onSaveNewChildRow={onSaveNewChildRow}
                  onCancelCreation={() => setCreatingParentId(null)}
                  createRowMutation={createRowMutation}
                  creatingParentId={creatingParentId}
                  editingRowId={editingRowId}
                  setCreatingParentId={setCreatingParentId}
                  setEditingRowId={setEditingRowId}
                  maxDepth={maxDepth}
                  draftError={draftError}
                  isSavingDraft={isSavingDraft}
                  onStartDraft={onStartDraft}
                  setIsCreatingTopRow={setIsCreatingTopRow}
                  setDraftError={setDraftError}
                />
              </td>
            </tr>
          </React.Fragment>
        );
      })}
    </>
  );
};

SubTagsExpanded.propTypes = {
  childRowsData: Proptypes.array.isRequired,
  visibleColumnCount: Proptypes.number,
  parentRowValue: Proptypes.string.isRequired,
  parentRowId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]).isRequired,
  isCreating: Proptypes.bool,
  onSaveNewChildRow: Proptypes.func,
  onCancelCreation: Proptypes.func,
  createRowMutation: Proptypes.object,
  creatingParentId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  editingRowId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  setCreatingParentId: Proptypes.func,
  setEditingRowId: Proptypes.func,
  maxDepth: Proptypes.number,
  draftError: Proptypes.string,
  isSavingDraft: Proptypes.bool,
  onStartDraft: Proptypes.func,
  setIsCreatingTopRow: Proptypes.func,
  setDraftError: Proptypes.func,
};

export default SubTagsExpanded;
