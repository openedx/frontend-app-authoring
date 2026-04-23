import React from 'react';
import { Row } from '@tanstack/react-table';
import type { CreateRowMutationState, TreeRowData } from './types';
import DraftRow from './DraftRow';

interface EditRowProps {
  draftError: string;
  setDraftError: (error: string) => void;
  initialValue: string;
  handleUpdateRow: (value: string) => void;
  cancelEditRow: () => void;
  updateRowMutation: CreateRowMutationState;
  indent?: number;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
  row: Row<TreeRowData>;
}

const EditRow: React.FC<EditRowProps> = ({
  draftError,
  setDraftError,
  initialValue,
  handleUpdateRow,
  cancelEditRow,
  updateRowMutation,
  indent = 0,
  validate,
  row,
}) => {
  const handleCancel = () => {
    setDraftError('');
    cancelEditRow();
  };

  return (
    <DraftRow
      draftError={draftError}
      initialValue={initialValue}
      onSave={handleUpdateRow}
      onCancel={handleCancel}
      mutationState={updateRowMutation}
      indent={indent}
      validate={validate}
      requireValueChangeToEnableSave
      row={row}
    />
  );
};

export default EditRow;
