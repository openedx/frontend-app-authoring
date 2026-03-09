import React, { useState, useEffect } from 'react';

import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import OptionalExpandLink from '../tag-list/OptionalExpandLink';

interface EditableCellProps {
  initialValue?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  isSaving?: boolean;
  getInlineValidationMessage?: (value: string) => string;
}

const EditableCell = ({
  initialValue = '',
  onKeyDown,
  onChange = () => {},
  errorMessage = '',
  isSaving = false,
  getInlineValidationMessage = () => '',
}: EditableCellProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const intl = useIntl();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const validationMessage = getInlineValidationMessage(value);
  const effectiveErrorMessage = errorMessage || validationMessage;

  return (
    <span className="d-flex align-items-start">
      <OptionalExpandLink forceHide />
      <span className="mr-2">
        <Form.Group controlId="editable-cell-input" className="mb-0">
          <Form.Control
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              onChange(e);
            }}
            size="sm"
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            floatingLabel={intl.formatMessage(messages.editTagInputLabel)}
            disabled={isSaving}
          />
          {effectiveErrorMessage && (
            <div className="text-danger small mt-1">{effectiveErrorMessage}</div>
          )}
        </Form.Group>
      </span>
    </span>
  );
};

export { EditableCell };
