import React, { useState } from 'react';
import { Button, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { EditableCell } from './EditableCell';
import type { CreateRowMutationState, TreeColumnDef } from './types';
import messages from './messages';

interface CreateRowProps {
  draftError: string;
  setDraftError: (error: string) => void;
  handleCreateRow: (value: string) => void;
  setIsCreatingTopRow: (isCreating: boolean) => void;
  exitDraftWithoutSave: () => void;
  createRowMutation: CreateRowMutationState;
  columns: TreeColumnDef[];
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
  columns,
  indent = 0,
  validate,
}) => {
  const [newRowValue, setNewRowValue] = useState('');
  const intl = useIntl();
  const [saveDisabled, setSaveDisabled] = useState(true);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewRowValue(value);
    const isValid = validate(value, 'soft');
    setSaveDisabled(!isValid || createRowMutation.isPending || false);
  };

  const handleCancel = () => {
    setDraftError('');
    setNewRowValue('');
    setIsCreatingTopRow(false);
    exitDraftWithoutSave();
  };

  const handleSave = () => {
    handleCreateRow(newRowValue.trim());
  };

  const handleValueCellKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newRowValue.trim() && !createRowMutation.isPending && !draftError) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <tr id="creating-top-row" data-testid="creating-top-row">
      <td colSpan={1} className="py-2 pr-2 pl-0">
        <div className={`tree-table-indent tree-table-indent-${indent}`}>
          <EditableCell
            errorMessage={draftError}
            isSaving={createRowMutation.isPending}
            onChange={handleValueChange}
            onKeyDown={handleValueCellKeyPress}
            autoFocus
          />
        </div>
      </td>
      <td
        colSpan={Math.max(columns.length - 1, 1)}
        className="tree-table-create-row-actions-cell p-2 align-top"
      >
        <span className="d-flex justify-content-end">
          <span className="mr-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
            >
              {intl.formatMessage(messages.cancelButtonLabel)}
            </Button>
          </span>
          <span className="mr-2">
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saveDisabled}>
              {intl.formatMessage(messages.saveButtonLabel)}
            </Button>
          </span>
          {createRowMutation.isPending && (
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              size="sm"
              screenReaderText={intl.formatMessage(messages.savingSpinnerScreenReaderText)}
            />
          )}
        </span>
      </td>
    </tr>
  );
};

export { CreateRow };
