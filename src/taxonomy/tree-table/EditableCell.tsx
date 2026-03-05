import React, { useState, useEffect } from 'react';

import { Button, Spinner } from '@openedx/paragon';

interface EditableCellProps {
  initialValue?: string;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  isSaving?: boolean;
  getInlineValidationMessage?: (value: string) => string;
}

const EditableCell = ({
  initialValue = '',
  onSave = () => {},
  onCancel = () => {},
  onChange = () => {},
  errorMessage = '',
  isSaving = false,
  getInlineValidationMessage = () => '',
}: EditableCellProps) => {
  const [value, setValue] = useState<string>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const validationMessage = getInlineValidationMessage(value);
  const effectiveErrorMessage = errorMessage || validationMessage;
  const isSaveDisabled = Boolean(validationMessage) || isSaving;

  const handleSave = () => {
    if (!isSaveDisabled) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <span className="d-flex align-items-start">
      <span className="mr-2">
        <input
          type="text"
          className="form-control form-control-sm"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e);
          }}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder="Type tag name"
        />
        {effectiveErrorMessage && (
          <div className="text-danger small mt-1">{effectiveErrorMessage}</div>
        )}
      </span>
      {/* <span className="mr-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </span>
      <span className="mr-2">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaveDisabled}>
          Save
        </Button>
      </span>
      {isSaving && (
        <Spinner
          animation="border"
          role="status"
          variant="primary"
          size="sm"
          screenReaderText="Saving..."
        />
      )} */}
    </span>
  );
};

export { EditableCell };
