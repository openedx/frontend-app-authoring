import React from 'react';
import type { CreateRowMutationState } from './types';
import DraftRow from './DraftRow';

interface CreateRowProps {
  draftError: string;
  setDraftError: (error: string) => void;
  handleCreateRow: (value: string) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  exitDraftWithoutSave: () => void;
  createRowMutation: CreateRowMutationState;
  indent?: number;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
}

const CreateRow: React.FC<CreateRowProps> = ({
  draftError,
  setDraftError,
  handleCreateRow,
  setIsCreatingTopRow,
  exitDraftWithoutSave,
  createRowMutation,
  indent = 0,
  validate,
}) => {
  const handleCancel = () => {
    setDraftError('');
    setIsCreatingTopRow(false);
    exitDraftWithoutSave();
  };

  return (
    <DraftRow
      draftError={draftError}
      onSave={handleCreateRow}
      onCancel={handleCancel}
      mutationState={createRowMutation}
      indent={indent}
      validate={validate}
      rowId="creating-top-row"
      rowTestId="creating-top-row"
    />
  );
};

export default CreateRow;
