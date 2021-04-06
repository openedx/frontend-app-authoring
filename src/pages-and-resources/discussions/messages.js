import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  settings: {
    id: 'authoring.discussions.settings',
    defaultMessage: 'Settings',
    description: 'A label for the second step of the app configuration stepper.',
  },
  configure: {
    id: 'authoring.discussions.configure',
    defaultMessage: 'Configure Discussions',
  },
  configureApp: {
    id: 'authoring.discussions.configure.app',
    defaultMessage: 'Configure {name}',
  },
  backButton: {
    id: 'authoring.discussions.backButton',
    defaultMessage: 'Back',
    description: 'Button allowing the user to return to discussion app selection.',
  },
  nextButton: {
    id: 'authoring.discussions.nextButton',
    defaultMessage: 'Next',
    description: 'Button allowing the user to advance to the second step of discussion configuration.',
  },
  applyButton: {
    id: 'authoring.discussions.applyButton',
    defaultMessage: 'Apply',
    description: 'Button allowing the user to submit their discussion configuration.',
  },
  applyingButton: {
    id: 'authoring.discussions.applyingButton',
    defaultMessage: 'Applying',
    description: 'Button label when the discussion configuration is being submitted.',
  },
  appliedButton: {
    id: 'authoring.discussions.appliedButton',
    defaultMessage: 'Applied',
    description: 'Button label when the discussion configuration has been successfully submitted.',
  },
  selectDiscussionTool: {
    id: 'authoring.discussions.selectDiscussionTool',
    defaultMessage: 'Select discussion tool',
    description: 'A label for the first step of a wizard where the user chooses a discussion tool to configure.',
  },
});

export default messages;
