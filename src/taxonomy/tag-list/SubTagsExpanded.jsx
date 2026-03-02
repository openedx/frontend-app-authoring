import React from 'react';
import Proptypes from 'prop-types';
import { flexRender } from '@tanstack/react-table';

import EditableCell from './EditableCell';

const SubTagsExpanded = ({
  parentTagValue,
  isCreating,
  onSaveNewSubTag,
  onCancelCreation,
  subTagsData,
  visibleColumnCount,
  createTagMutation,
  creatingParentId,
  editingRowId,
  setCreatingParentId,
  setEditingRowId,
  maxDepth,
  draftError,
  isSavingDraft,
  onStartDraft,
  setIsCreatingTopTag,
  setDraftError,
}) => {
  const columnCount = subTagsData?.[0]?.getVisibleCells?.().length || visibleColumnCount || 1;

  return (
    <>
      {isCreating && (
        <tr>
          <td colSpan={columnCount} style={{ padding: '8px 8px 8px 0' }}>
            <EditableCell
              errorMessage={draftError}
              isSaving={isSavingDraft}
              onSave={(val) => onSaveNewSubTag(val, parentTagValue)}
              onCancel={() => {
                setDraftError('');
                onCancelCreation();
              }}
              getInlineValidationMessage={(value) => {
                if (!value.trim()) {
                  return 'Tag name cannot be empty.';
                }
                return '';
              }}
            />
          </td>
        </tr>
      )}
      {subTagsData?.map(row => {
        const tagData = row.original || row; // Handle both raw and table row data
        return (
          <React.Fragment key={tagData.id}>
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
                  subTagsData={row.subRows}
                  visibleColumnCount={row.getVisibleCells().length}
                  parentTagValue={row.original.value}
                  parentTagId={row.original.id}
                  isCreating={creatingParentId === row.original.id}
                  onSaveNewSubTag={onSaveNewSubTag}
                  onCancelCreation={() => setCreatingParentId(null)}
                  createTagMutation={createTagMutation}
                  creatingParentId={creatingParentId}
                  editingRowId={editingRowId}
                  setCreatingParentId={setCreatingParentId}
                  setEditingRowId={setEditingRowId}
                  maxDepth={maxDepth}
                  draftError={draftError}
                  isSavingDraft={isSavingDraft}
                  onStartDraft={onStartDraft}
                  setIsCreatingTopTag={setIsCreatingTopTag}
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
  subTagsData: Proptypes.array.isRequired,
  visibleColumnCount: Proptypes.number,
  parentTagValue: Proptypes.string.isRequired,
  parentTagId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]).isRequired,
  isCreating: Proptypes.bool,
  onSaveNewSubTag: Proptypes.func,
  onCancelCreation: Proptypes.func,
  createTagMutation: Proptypes.object,
  creatingParentId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  editingRowId: Proptypes.oneOfType([Proptypes.string, Proptypes.number]),
  setCreatingParentId: Proptypes.func,
  setEditingRowId: Proptypes.func,
  maxDepth: Proptypes.number,
  draftError: Proptypes.string,
  isSavingDraft: Proptypes.bool,
  onStartDraft: Proptypes.func,
  setIsCreatingTopTag: Proptypes.func,
  setDraftError: Proptypes.func,
};

export default SubTagsExpanded;
