/* Formik-compatible validators. */
import { useIntl } from '@edx/frontend-platform/i18n';
import type { FieldValidator } from 'formik';
import messages from '../sharedComponents/UploadWidget/messages';

export const useUrlValidator = () => {
  const intl = useIntl();
  const validator: FieldValidator = (url: string) => {
    try {
      new URL(url); /* eslint-disable-line no-new */
    } catch {
      return intl.formatMessage(messages.invalidUrl);
    }
    return undefined;
  };
  return validator;
};

export const optional = (func: FieldValidator) => {
  const validator: FieldValidator = (value: unknown) => {
    if (!value) {
      return undefined;
    }
    return func(value);
  };
  return validator;
};
