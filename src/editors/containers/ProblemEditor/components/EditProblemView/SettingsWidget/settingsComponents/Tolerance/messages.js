import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  toleranceSettingTitle: {
    id: 'problemEditor.settings.tolerance.title',
    defaultMessage: 'Tolerance',
    description: 'Title for tolerance setting menu',
  },
  noneToleranceSummary: {
    id: 'problemEditor.settings.tolerance.summary.none',
    defaultMessage: 'None',
    description: 'message provided when no tolerance is set for a problem',
  },
  toleranceSettingText: {
    id: 'problemEditor.settings.tolerance.description.text',
    defaultMessage: 'The margin of error on either side of an answer.',
    description: 'Description of the features of setting a tolerance for a problem',
  },
  toleranceValueInputLabel: {
    id: 'problemEditor.settings.tolerance.valueinput',
    defaultMessage: 'Tolerance',
    description: 'floating label for input to set the value of the tolerance',
  },
  toleranceAnswerRangeWarning: {
    id: 'problemEditor.settings.tolerance.answerrangewarning',
    defaultMessage: 'Tolerance cannot be applied to an answer range',
    description: 'a warning to users that tolerance cannot be aplied to an answer range.',
  },
  typesPercentage: {
    id: 'problemEditor.settings.tolerance.type.percent',
    defaultMessage: 'Percentage',
    description: 'A possible value type for a tolerance',

  },
  typesNumber: {
    id: 'problemEditor.settings.tolerance.type.number',
    defaultMessage: 'Number',
    description: 'A possible value type for a tolerance',

  },
  typesNone: {
    id: 'problemEditor.settings.tolerance.type.none',
    defaultMessage: 'None',
    description: 'A possible value type for a tolerance',
  },

});

export default messages;
