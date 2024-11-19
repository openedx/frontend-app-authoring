import * as Yup from 'yup';

import messages from './messages';
import { allGroupNamesAreUnique } from './utils';

export const experimentFormValidationSchema = (formatMessage) => Yup.object().shape({
  id: Yup.number(),
  name: Yup.string()
    .trim()
    .required(formatMessage(messages.experimentConfigurationNameRequired)),
  description: Yup.string(),
  groups: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number(),
        name: Yup.string()
          .trim()
          .required(
            formatMessage(messages.experimentConfigurationGroupsNameRequired),
          ),
        version: Yup.number(),
        usage: Yup.array().nullable(true),
      }),
    )
    .required()
    .min(1, formatMessage(messages.experimentConfigurationGroupsRequired))
    .test(
      'unique-group-name-restriction',
      formatMessage(messages.experimentConfigurationGroupsNameUnique),
      (values) => allGroupNamesAreUnique(values),
    ),
  scheme: Yup.string(),
  version: Yup.number(),
  parameters: Yup.object(),
  usage: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string(),
        url: Yup.string(),
      }),
    )
    .nullable(true),
  active: Yup.bool(),
});
