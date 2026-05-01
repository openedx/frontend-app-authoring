import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ENUM_OPTIONS } from '../../data/fieldTypes';
import { ENUM_LABEL_MESSAGES } from '../../data/fieldTypeMessages';

export interface EnumInputProps {
  value?: string;
  name: string;
  displayName: string;
  onChange: (value: string) => void;
}

const EnumInput = ({
  value = '',
  name,
  displayName,
  onChange,
}: EnumInputProps) => {
  const intl = useIntl();
  const options = ENUM_OPTIONS[name] || [];

  return (
    <Form.Control
      as="select"
      value={value ?? ''}
      name={name}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
      aria-label={displayName || name}
    >
      {options.map(({ value: optValue, label }) => {
        const msgDescriptor = ENUM_LABEL_MESSAGES[name]?.[optValue];
        const localizedLabel = msgDescriptor ? intl.formatMessage(msgDescriptor) : label;
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
