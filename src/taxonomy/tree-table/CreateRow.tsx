import React, { useContext } from 'react';
import DraftRow from './DraftRow';
import { TreeTableContext } from './TreeTableContext';

interface CreateRowProps {
  handleCreateRow?: (value: string) => void;
  exitDraftWithoutSave?: () => void;
  indent?: number;
}

const CreateRow: React.FC<CreateRowProps> = ({
  handleCreateRow,
  exitDraftWithoutSave,
  indent = 0,
}) => {
  const {
    setDraftError,
    handleCreateRow: contextHandleCreateRow,
    setIsCreatingTopRow,
    exitDraftWithoutSave: contextExitDraftWithoutSave,
    createRowMutation,
  } = useContext(TreeTableContext);

  const onCreateRow = handleCreateRow ?? contextHandleCreateRow;
  const onExitDraftWithoutSave = exitDraftWithoutSave ?? contextExitDraftWithoutSave;

  const handleCancel = () => {
    setDraftError('');
    setIsCreatingTopRow(false);
    onExitDraftWithoutSave();
  };

  return (
    <DraftRow
      onSave={onCreateRow}
      onCancel={handleCancel}
      mutationState={createRowMutation}
      indent={indent}
      rowId="creating-top-row"
      rowTestId="creating-top-row"
    />
  );
};

export default CreateRow;
