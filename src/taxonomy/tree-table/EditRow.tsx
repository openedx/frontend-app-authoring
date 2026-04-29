import React, { useContext } from 'react';
import { Row } from '@tanstack/react-table';
import type { TreeRowData } from './types';
import DraftRow from './DraftRow';
import { TreeTableContext } from './TreeTableContext';

interface EditRowProps {
  initialValue: string;
  handleUpdateRow: (value: string) => void;
  cancelEditRow: () => void;
  indent?: number;
  row: Row<TreeRowData>;
}

const EditRow: React.FC<EditRowProps> = ({
  initialValue,
  handleUpdateRow,
  cancelEditRow,
  indent = 0,
  row,
}) => {
  const {
    setDraftError,
    updateRowMutation,
  } = useContext(TreeTableContext);

  const handleCancel = () => {
    setDraftError('');
    cancelEditRow();
  };

  return (
    <DraftRow
      initialValue={initialValue}
      onSave={handleUpdateRow}
      onCancel={handleCancel}
      mutationState={updateRowMutation}
      indent={indent}
      requireValueChangeToEnableSave
      row={row}
    />
  );
};

export default EditRow;
