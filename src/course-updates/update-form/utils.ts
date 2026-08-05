import * as Yup from 'yup';
import type { IntlShape } from 'react-intl';

import { REQUEST_TYPES } from '../constants';
import type { ValueOf } from '@src/types';
import type { CourseHandouts, CourseUpdate } from '../data/api';
import messages from './messages';

export type UpdateFormValues = Omit<CourseUpdate, 'date'> & { date: string | Date; } & CourseHandouts;
type RequestType = ValueOf<typeof REQUEST_TYPES>;
type UpdateFormSettings = {
  currentContent: string;
  validationSchema: Yup.AnyObjectSchema;
  formTitle: string;
  submitButtonText: string;
  contentFieldName: 'data' | 'content';
};

const geUpdateFormSettings = (
  requestType: RequestType,
  courseUpdatesInitialValues: UpdateFormValues | CourseHandouts,
  intl: IntlShape,
): UpdateFormSettings => {
  const updatesValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    date: Yup.date().required(),
    content: Yup.string()
      .required(intl.formatMessage(messages.updateFormContentRequired))
      .test(
        'content-not-empty-html',
        intl.formatMessage(messages.updateFormContentRequired),
        (value) =>
          (value || '')
            .replace(/<[^>]*>/g, '')
            .replace(/&(nbsp|#160|#xA0);/gi, '')
            .trim().length > 0,
      ),
  });

  switch (requestType) {
    case REQUEST_TYPES.edit_handouts:
      return {
        currentContent: courseUpdatesInitialValues.data || '',
        formTitle: intl.formatMessage(messages.editHandoutsTitle),
        validationSchema: Yup.object().shape({}),
        contentFieldName: 'data',
        submitButtonText: intl.formatMessage(messages.saveButton),
      };
    case REQUEST_TYPES.add_new_update:
      return {
        currentContent: (courseUpdatesInitialValues as UpdateFormValues).content,
        formTitle: intl.formatMessage(messages.addNewUpdateTitle),
        validationSchema: updatesValidationSchema,
        contentFieldName: 'content',
        submitButtonText: intl.formatMessage(messages.postButton),
      };
    case REQUEST_TYPES.edit_update:
      return {
        currentContent: (courseUpdatesInitialValues as UpdateFormValues).content,
        formTitle: intl.formatMessage(messages.editUpdateTitle),
        validationSchema: updatesValidationSchema,
        contentFieldName: 'content',
        submitButtonText: intl.formatMessage(messages.postButton),
      };
    default:
      return '' as unknown as UpdateFormSettings;
  }
};

export { geUpdateFormSettings };
