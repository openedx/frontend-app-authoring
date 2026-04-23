import { Form } from '@openedx/paragon';

interface StringInputProps {
  value?: string;
  name: string;
  displayName: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
}

const StringInput = ({
  value = '', name, displayName, onChange, onBlur, placeholder = '',
}: StringInputProps) => (
  <Form.Control
    type="text"
    value={value ?? ''}
    name={name}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    aria-label={displayName || name}
    placeholder={placeholder}
  />
);

export default StringInput;
