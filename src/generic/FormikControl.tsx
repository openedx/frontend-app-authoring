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
  setFieldValue?: (name: string, value: any) => void;
}

// Because <Form.Control> is only typed as 'any' in Paragon so far, the props of the following become 'any' :/
// oxlint-disable-next-line @typescript-eslint(no-redundant-type-constituents
const FormikControl: React.FC<Props & React.ComponentProps<typeof Form.Control>> = ({
  name,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  label = <></>,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  help = <></>,
  className = '',
  controlClasses = 'pb-2',
  setFieldValue,
  ...params
}) => {
  const formikContext = useFormikContext() || null;

  const fieldTouched = formikContext ? getIn(formikContext.touched, name) : false;
  const fieldError = formikContext ? getIn(formikContext.errors, name) : undefined;
  const handleFocus = formikContext ? (
    e: { target: { name: any; } },
  ) => formikContext?.setFieldError(e.target.name, undefined) : undefined;
  const handleBlur = formikContext ? formikContext.handleBlur : undefined;
  const handleChange = formikContext ? formikContext.handleChange : undefined;
  const formikSetFieldValue = formikContext ? formikContext.setFieldValue : undefined;

  return (
    <Form.Group className={className}>
      {label}
      <Form.Control
        {...params}
        name={name}
        className={controlClasses}
        onChange={async (e: { target: { value: any; }; }) => {
          if (setFieldValue) {
            setFieldValue(name, e.target.value);
            return;
          }
          if (handleChange) {
            handleChange(e);
            return;
          }
          if (formikSetFieldValue) {
            await formikSetFieldValue(name, e.target.value);
          }
        }}
        onBlur={handleBlur}
        onFocus={handleFocus}
        isInvalid={!!fieldTouched && !!fieldError}
      />
      {formikContext && (
        <FormikErrorFeedback name={name}>
          <Form.Text>{help}</Form.Text>
        </FormikErrorFeedback>
      )}
    </Form.Group>
  );
};

export default FormikControl;
