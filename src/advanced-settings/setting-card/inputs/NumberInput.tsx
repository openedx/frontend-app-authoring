import { ChangeEvent } from 'react';
import { Form } from '@openedx/paragon';

interface NumberInputProps {
  value?: number | string;
  name: string;
  displayName: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
}

const NumberInput = ({
  value = '',
  name,
  displayName,
  onChange,
  onBlur,
  placeholder = '',
}: NumberInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^0-9.-]/g, '');
    if (filtered !== String(value ?? '')) {
      onChange(filtered);
    }
  };

  return (
    <Form.Control
      type="text"
      inputMode="numeric"
      value={value ?? ''}
      name={name}
      onChange={handleChange}
      onBlur={onBlur}
      aria-label={displayName || name}
      placeholder={placeholder}
    />
  );
};

export default NumberInput;
