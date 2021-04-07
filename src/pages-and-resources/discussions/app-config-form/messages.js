import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  configureApp: {
    id: 'authoring.discussions.configure.app',
    defaultMessage: 'Configure {name}',
  },
  configure: {
    id: 'authoring.discussions.configure',
    defaultMessage: 'Configure Discussions',
  },
  backButton: {
    id: 'authoring.discussions.backButton',
    defaultMessage: 'Back',
    description: 'Button allowing the user to return to discussion app selection.',
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

  // App names
  'appName-piazza': {
    id: 'authoring.discussions.appConfigForm.appName-piazza',
    defaultMessage: 'Piazza',
    description: 'The name of the Piazza app.',
  },
  'appName-legacy': {
    id: 'authoring.discussions.appConfigForm.appName-legacy',
    defaultMessage: 'edX Discussions',
    description: 'The name of the Legacy edX Discussions app.',
  },
});

export default messages;
