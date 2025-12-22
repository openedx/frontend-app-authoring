import { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import messages from './messages';
import { useSubmitAccessibilityForm } from '../data/apiHooks';
import { AccessibilityFormData } from '../data/api';

const useAccessibility = (initialValues: AccessibilityFormData) => {
  const intl = useIntl();
  const [isFormFilled, setFormFilled] = useState(false);
  const validationSchema = Yup.object().shape({
    name: Yup.string().required(
      intl.formatMessage(messages.accessibilityPolicyFormValidName),
    ),
    email: Yup.string()
      .email(intl.formatMessage(messages.accessibilityPolicyFormValidEmail))
      .required(intl.formatMessage(messages.accessibilityPolicyFormValidEmail)),
    message: Yup.string().required(
      intl.formatMessage(messages.accessibilityPolicyFormValidMessage),
    ),
  });

  const {
    values, errors, touched, handleChange, handleBlur, handleReset,
  } = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnBlur: false,
    validationSchema,
    /* istanbul ignore next */
    onSubmit: () => {},
  });

  const mutation = useSubmitAccessibilityForm(handleReset);

  useEffect(() => {
    setFormFilled(Object.values(values).every((i) => i));
  }, [values]);

  const hasErrorField = (fieldName) => !!errors[fieldName] && !!touched[fieldName];

  return {
    errors,
    values,
    isFormFilled,
    mutation,
    handleBlur,
    handleChange,
    hasErrorField,
    savingStatus: mutation.status,
  };
};

export default useAccessibility;
