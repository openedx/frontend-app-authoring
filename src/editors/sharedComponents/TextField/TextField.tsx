import { Col, Form } from '@openedx/paragon';
import { useField, FieldHookConfig } from 'formik';
import React from 'react';

declare interface TextFieldProps {
  label: string;
  id: string;
  type?: string;
  hint?: string;
  placeholder?: string;
  name: string;
  disabled?: boolean;
  // For any other formik settings.
  fieldConfig?: Omit<FieldHookConfig<string>, 'name'>;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  id,
  hint = '',
  type = 'text',
  placeholder = '',
  fieldConfig,
  disabled = false,
}) => {
  const [field, meta] = useField({ name, ...fieldConfig } as FieldHookConfig<string>);
  return (
    <Form.Group as={Col} controlId={id}>
      <Form.Label>{label}</Form.Label>
      {hint && <Form.Control.Feedback>{hint}</Form.Control.Feedback>}
      <Form.Control
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...field}
      />
      {meta.error && <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>}
    </Form.Group>
  );
};

export default TextField;
