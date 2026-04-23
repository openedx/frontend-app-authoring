import { Form } from '@openedx/paragon';

interface BooleanInputProps {
  value: boolean;
  name: string;
  displayName: string;
  onChange: (value: boolean) => void;
}

const BooleanInput = ({
  value, name, displayName, onChange,
}: BooleanInputProps) => (
  <Form.Switch
    id={`setting-bool-${name}`}
    checked={!!value}
    onChange={(e) => onChange(e.target.checked)}
    aria-label={displayName || name}
    className="m-0"
  />
);

export default BooleanInput;
