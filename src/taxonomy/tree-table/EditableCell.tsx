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

/**
 * Props for the EditableCell component.
 * @interface EditableCellProps
 * @property {string} [initialValue] - The initial value to display in the cell
 * @property {function} [onKeyDown] - Callback function triggered on keyboard events
 * @property {function} [onChange] - Callback function triggered when the input value changes
 * @property {string} [errorMessage] - Error message to display if validation fails
 * @property {boolean} [isSaving] - Indicates whether the cell value is currently being saved to the server
 * @property {boolean} [autoFocus] - If true, the input field will automatically receive focus when the cell
 * enters edit mode
 * @property {function} [getInlineValidationMessage] - Function that returns a validation message to be displayed
 * based on the current input value.
 */
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
  const [validationMessage, setValidationMessage] = useState<string>('');''
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const intl = useIntl();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [inputRef.current]); // autoFocus explicitly not a dependency, to avoid unexpected focus change.

  useEffect(() => {
    setValue(initialValue);
    setValidationMessage(getInlineValidationMessage(initialValue));
  }, []); // initialValue explicitly not a dependency, to avoid overwriting user input.

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
              setValidationMessage(getInlineValidationMessage(e.target.value));
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
