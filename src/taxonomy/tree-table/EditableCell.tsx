import React, {
  useState,
  useEffect,
  useId,
  useRef,
} from 'react';

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
  autoFocus?: boolean;
  getInlineValidationMessage?: (value: string) => string;
}

const EditableCell = ({
  initialValue = '',
  onKeyDown,
  onChange = () => {},
  errorMessage = '',
  isSaving = false,
  getInlineValidationMessage = () => '',
  autoFocus = false,
}: EditableCellProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const intl = useIntl();

  useEffect(() => {
    if (autoFocus) {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [autoFocus]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const validationMessage = getInlineValidationMessage(value);
  const effectiveErrorMessage = errorMessage || validationMessage;
  const errorMessageId = `${inputId}-error`;

  return (
    <span className="d-flex align-items-start">
      <OptionalExpandLink forceHide />
      <span className="mr-2">
        <Form.Group controlId={inputId} className="mb-0">
          <Form.Control
            ref={inputRef}
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
            autoComplete="off"
            isInvalid={!!effectiveErrorMessage}
            aria-describedby={effectiveErrorMessage ? errorMessageId : undefined}
          />
          {effectiveErrorMessage && (
            <div id={errorMessageId} role="alert" aria-live="polite" className="text-danger small mt-1">
              {effectiveErrorMessage}
            </div>
          )}
        </Form.Group>
      </span>
    </span>
  );
};

export { EditableCell };
