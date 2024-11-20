import * as Yup from 'yup';

import { REQUEST_TYPES } from '../constants';
import messages from './messages';

/**
 * Get Update form settings depending on requestType
 * @param {typeof REQUEST_TYPES} requestType - one of REQUEST_TYPES
 * @param {object} courseUpdatesInitialValues - form initial values depending on requestType
 * @returns {{
  *  currentContent: string,
  *  validationSchema: object,
  *  formTitle: string,
  *  submitButtonText: string,
  *  contentFieldName: string
 *  }}
 */
const geUpdateFormSettings = (requestType, courseUpdatesInitialValues, intl) => {
  const updatesValidationSchema = Yup.object().shape({
    id: Yup.number().required(),
    date: Yup.date().required(),
    content: Yup.string(),
  });

  switch (requestType) {
    case REQUEST_TYPES.edit_handouts:
      return {
        currentContent: courseUpdatesInitialValues.data,
        formTitle: intl.formatMessage(messages.editHandoutsTitle),
        validationSchema: Yup.object().shape(),
        contentFieldName: 'data',
        submitButtonText: intl.formatMessage(messages.saveButton),
      };
    case REQUEST_TYPES.add_new_update:
      return {
        currentContent: courseUpdatesInitialValues.content,
        formTitle: intl.formatMessage(messages.addNewUpdateTitle),
        validationSchema: updatesValidationSchema,
        contentFieldName: 'content',
        submitButtonText: intl.formatMessage(messages.postButton),
      };
    case REQUEST_TYPES.edit_update:
      return {
        currentContent: courseUpdatesInitialValues.content,
        formTitle: intl.formatMessage(messages.editUpdateTitle),
        validationSchema: updatesValidationSchema,
        contentFieldName: 'content',
        submitButtonText: intl.formatMessage(messages.postButton),
      };
    default:
      return '';
  }
};

export { geUpdateFormSettings };
