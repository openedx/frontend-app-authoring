import React from 'react';
import { FieldHookConfig, useField } from 'formik';
import { Col, Form } from '@openedx/paragon';

declare interface CheckboxFieldProps {
  label: string,
  id: string,
  hint: string,
  fieldConfig: string | FieldHookConfig<string>,
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label, id, hint = '', fieldConfig,
}) => {
  const [field, meta] = useField(fieldConfig);
  return (
    <Form.Group as={Col} controlId={id}>
      <Form.Checkbox
        checked={field.value}
        {...field}
      >
        {label}
      </Form.Checkbox>
      {hint && <Form.Control.Feedback>{hint}</Form.Control.Feedback>}
      {meta.error && <Form.Control.Feedack type="invalid">{meta.error}</Form.Control.Feedack>}
    </Form.Group>
  );
};

export default CheckboxField;
