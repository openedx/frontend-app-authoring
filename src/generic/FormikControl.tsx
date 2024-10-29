import React from 'react';
import { Form } from '@openedx/paragon';
import { getIn, useFormikContext } from 'formik';
import FormikErrorFeedback from './FormikErrorFeedback';

interface Props {
  name: string;
  label?: React.ReactElement;
  help?: React.ReactElement;
  className?: string;
  controlClasses?: string;
  value: string | number;
}

const FormikControl: React.FC<Props & React.ComponentProps<typeof Form.Control>> = ({
  name,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  label = <></>,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  help = <></>,
  className = '',
  controlClasses = 'pb-2',
  ...params
}) => {
  const {
    touched, errors, handleChange, handleBlur, setFieldError,
  } = useFormikContext();
  const fieldTouched = getIn(touched, name);
  const fieldError = getIn(errors, name);
  const handleFocus = (e) => setFieldError(e.target.name, undefined);

  return (
    <Form.Group className={className}>
      {label}
      <Form.Control
        {...params}
        name={name}
        className={controlClasses}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        isInvalid={!!fieldTouched && !!fieldError}
      />
      <FormikErrorFeedback name={name}>
        <Form.Text>{help}</Form.Text>
      </FormikErrorFeedback>
    </Form.Group>
  );
};

export default FormikControl;
