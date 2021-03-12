import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'authoring.discussions.heading',
    defaultMessage: 'Which discussion tool would you like to use for this course?',
  },
  supportedFeatures: {
    id: 'authoring.discussions.supportedFeatures',
    defaultMessage: 'Supported Features',
  },
  configureApp: {
    id: 'authoring.discussions.configure.app',
    defaultMessage: 'Configure {name}',
  },
  configure: {
    id: 'authoring.discussions.configure',
    defaultMessage: 'Configure Discussions',
  },
  appLogo: {
    id: 'authoring.discussions.appLogo',
    defaultMessage: '{name} Logo',
  },
  configModalTitle: {
    id: 'authoring.discussions.modalTitle',
    defaultMessage: 'Configure {name}',
  },
  saveConfig: {
    id: 'authoring.discussions.saveConfig',
    defaultMessage: 'Save',
    description: 'Button allowing a user to save their discussions config.',
  },
  savingConfig: {
    id: 'authoring.discussions.savingConfig',
    defaultMessage: 'Saving',
    description: 'Button text shown while a discussion config is being saved.',
  },
  savedConfig: {
    id: 'authoring.discussions.savedConfig',
    defaultMessage: 'Saved',
    description: 'Button text shown once a discussion config has been saved to the server.',
  },
  backButton: {
    id: 'authoring.discussions.backButton',
    defaultMessage: 'Back',
    description: 'Button allowing the user to return to discussion app selection.',
  },
  nextButton: {
    id: 'authoring.discussions.nexyButton',
    defaultMessage: 'Next',
    description: 'Button allowing the user to advance to the second step of discussion configuration.',
  },
  applyButton: {
    id: 'authoring.discussions.applyButton',
    defaultMessage: 'Apply',
    description: 'Button allowing the user to submit their discussion configuration.',
  },
  selectDiscussionTool: {
    id: 'authoring.discussions.selectDiscussionTool',
    defaultMessage: 'Select discussion tool',
    description: 'A label for the first step of a wizard where the user chooses a discussion tool to configure.',
  },
});

export default messages;
