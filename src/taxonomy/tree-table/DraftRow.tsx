import React, { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Spinner } from '@openedx/paragon';
import { Row } from '@tanstack/react-table';

import UsageCountDisplay from '@src/taxonomy/tag-list/UsageCountDisplay';
import { EditableCell } from './EditableCell';
import type { CreateRowMutationState, TreeRowData } from './types';
import messages from './messages';

interface DraftRowProps {
  draftError: string;
  initialValue?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  mutationState: CreateRowMutationState;
  indent?: number;
  validate: (value: string, mode?: 'soft' | 'hard') => boolean;
  requireValueChangeToEnableSave?: boolean;
  rowTestId?: string;
  rowId?: string;
  row?: Row<TreeRowData>;
}

const DraftRow: React.FC<DraftRowProps> = ({
  draftError,
  initialValue = '',
  onSave,
  onCancel,
  mutationState,
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

  return (
    <tr id={rowId} data-testid={rowTestId}>
      <td className="py-2 pr-2 pl-0">
        <div className={`tree-table-indent-${indent}`}>
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
      <td aria-label="Usage Count">
        {row ? <UsageCountDisplay row={row} /> : null}
      </td>
      <td
        className="tree-table-create-row-actions-cell p-2"
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

export default DraftRow;
