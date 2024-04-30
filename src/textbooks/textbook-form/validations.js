import * as Yup from 'yup';

import messages from './messages';

const textbookFormValidationSchema = (intl) => Yup.object().shape({
  tab_title: Yup.string().required(intl.formatMessage(messages.tabTitleValidationText)).max(255),
  chapters: Yup.array().of(
    Yup.object({
      title: Yup.string().required((intl.formatMessage(messages.chapterTitleValidationText))).max(255),
      url: Yup.string().required(intl.formatMessage(messages.chapterUrlValidationText)).max(255),
    }),
  ).min(1),
});

export default textbookFormValidationSchema;
