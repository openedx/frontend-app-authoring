import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { EnumOption } from '../../data/fieldTypes';
import { ENUM_LABEL_MESSAGES } from '../../data/fieldTypeMessages';

export interface EnumInputProps {
  value?: string;
  name: string;
  displayName: string;
  /** Valid choices for this field, provided by the backend. */
  options?: EnumOption[];
  onChange: (value: string) => void;
}

const EnumInput = ({
  value = '',
  name,
  displayName,
  options = [],
  onChange,
}: EnumInputProps) => {
  const intl = useIntl();
  const safeOptions = Array.isArray(options) ? options : [];

  // Safety net: never let the <select> hide the current value. If the course has
  // a value the backend no longer lists as an option, surface it as a selectable
  // option so it is shown and not silently dropped on save.
  const optionsWithCurrent = value && !safeOptions.some((opt) => opt.value === value)
    ? [{ value, displayName: value }, ...safeOptions]
    : safeOptions;

  return (
    <Form.Control
      as="select"
      value={value ?? ''}
      name={name}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
      aria-label={displayName || name}
    >
      {optionsWithCurrent.map(({ value: optValue, displayName: optLabel }) => {
        const msgDescriptor = ENUM_LABEL_MESSAGES[name]?.[optValue];
        const localizedLabel = msgDescriptor ? intl.formatMessage(msgDescriptor) : (optLabel ?? optValue);
        return (
          <option key={optValue} value={optValue}>
            {localizedLabel}
          </option>
        );
      })}
    </Form.Control>
  );
};

export default EnumInput;
