import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  generalFeebackSettingTitle: {
    id: 'authoring.problemeditor.settings.generalFeebackSettingTitle',
    defaultMessage: 'General Feedback',
    description: 'label for general feedback setting',
  },
  generalFeedbackInputLabel: {
    id: 'authoring.problemeditor.settings.generalFeedbackInputLabel',
    defaultMessage: 'Enter General Feedback',
    description: 'label for general feedback input describing rules',
  },
  generalFeedbackDescription: {
    id: 'authoring.problemeditor.settings.generalFeedbackInputDescription',
    defaultMessage: 'Enter the feedback to appear when a student submits a wrong answer. This will be overridden if you add answer-specific feedback.',
    description: 'description for general feedback input, clariying useage',
  },
  noGeneralFeedbackSummary: {
    id: 'authoring.problemeditor.settings.generalFeedback.noFeedbackSummary',
    defaultMessage: 'None',
    description: 'message which informs use there is no general feedback set.',
  },
});
export default messages;
