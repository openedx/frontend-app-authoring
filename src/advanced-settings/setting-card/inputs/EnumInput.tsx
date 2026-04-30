import { useIntl } from '@edx/frontend-platform/i18n';
import { ENUM_OPTIONS } from '../../data/fieldTypes';
import { ENUM_LABEL_MESSAGES } from '../../data/fieldTypeMessages';

interface EnumInputProps {
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
    <select
      className="form-control"
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
    </select>
  );
};

export default EnumInput;
