import React, { useState } from 'react';
import { Button, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { EditableCell } from './EditableCell';
import type { CreateRowMutationState, TreeColumnDef } from './types';
import messages from './messages';
import { Row } from '@tanstack/react-table';
import { UsageCountDisplay } from '../tag-list/UsageCountDisplay';

interface DraftRowProps {
  draftError: string;
  initialValue?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  mutationState: CreateRowMutationState;
  columns: TreeColumnDef[];
  indent?: number;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
  requireValueChangeToEnableSave?: boolean;
  rowTestId?: string;
  rowId?: string;
  row?: any;
}

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

interface EditRowProps {
  draftError: string;
  setDraftError: (error: string) => void;
  initialValue: string;
  handleUpdateRow: (value: string) => void;
  cancelEditRow: () => void;
  updateRowMutation: CreateRowMutationState;
  columns: TreeColumnDef[];
  indent?: number;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
  row: any;
}

const DraftRow: React.FC<DraftRowProps> = ({
  draftError,
  initialValue = '',
  onSave,
  onCancel,
  mutationState,
  columns,
  indent = 0,
  validate,
  requireValueChangeToEnableSave = false,
  rowTestId,
  rowId,
  row,

}) => {
  const [rowValue, setRowValue] = useState(initialValue);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const intl = useIntl();

  const updateSaveDisabled = (value: string) => {
    const trimmedValue = value.trim();
    const isValid = validate(value, 'soft');
    const isUnchanged = requireValueChangeToEnableSave && trimmedValue === initialValue.trim();
    setSaveDisabled(!isValid || !trimmedValue || isUnchanged || mutationState.isPending || false);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setRowValue(value);
    updateSaveDisabled(value);
  };

  const handleSave = () => {
    onSave(rowValue.trim());
  };

  const handleValueCellKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !saveDisabled && !draftError) {
      e.preventDefault();
      handleSave();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const indentClass = indent > 0 ? `tree-table-indent tree-table-indent-${indent}` : '';

  return (
    <tr id={rowId} data-testid={rowTestId}>
      <td colSpan={1} className="py-2 pr-2 pl-0">
        <div className={indentClass}>
          <EditableCell
            initialValue={initialValue}
            errorMessage={draftError}
            isSaving={mutationState.isPending}
            onChange={handleValueChange}
            onKeyDown={handleValueCellKeyPress}
            autoFocus
          />
        </div>
      </td>
      <td colSpan={1} aria-label="Usage Count">
        {row ? <UsageCountDisplay row={row} /> : null}
      </td>
      <td
        colSpan={1}
        className="tree-table-create-row-actions-cell p-2 align-top"
      >
        <span className="d-flex justify-content-end">
          <span className="mr-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onCancel}
            >
              {intl.formatMessage(messages.cancelButtonLabel)}
            </Button>
          </span>
          <span className="mr-2">
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saveDisabled}>
              {intl.formatMessage(messages.saveButtonLabel)}
            </Button>
          </span>
          {mutationState.isPending && (
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
      columns={columns}
      indent={indent}
      validate={validate}
      rowId="creating-top-row"
      rowTestId="creating-top-row"
    />
  );
};

const EditRow: React.FC<EditRowProps> = ({
  draftError,
  setDraftError,
  initialValue,
  handleUpdateRow,
  cancelEditRow,
  updateRowMutation,
  columns,
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
      columns={columns}
      indent={indent}
      validate={validate}
      requireValueChangeToEnableSave
      row={row}
    />
  );
};

export { CreateRow, EditRow };
