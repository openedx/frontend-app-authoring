import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  settings: {
    id: 'authoring.live.settings',
    defaultMessage: 'Settings',
    description: 'A label for the second step of the live configuration stepper.',
  },
  configure: {
    id: 'authoring.live.configure',
    defaultMessage: 'Configure Live',
  },
  configureApp: {
    id: 'authoring.live.configure.app',
    defaultMessage: 'Configure {name}',
  },
  backButton: {
    id: 'authoring.live.backButton',
    defaultMessage: 'Back',
    description: 'Button allowing the user to return to live app selection.',
  },
  applyButton: {
    id: 'authoring.live.applyButton',
    defaultMessage: 'Apply',
    description: 'Button allowing the user to submit their live conference configuration.',
  },
  applyingButton: {
    id: 'authoring.live.applyingButton',
    defaultMessage: 'Applying',
    description: 'Button label when the live conference configuration is being submitted.',
  },
  appliedButton: {
    id: 'authoring.live.appliedButton',
    defaultMessage: 'Applied',
    description: 'Button label when the live conference configuration has been successfully submitted.',
  },
  providerSelection: {
    id: 'authoring.live.providerSelection',
    defaultMessage: 'Provider selection',
    description: 'A label for the first step of a wizard where the user chooses a live live conferencing tool to configure.',
  },
  Incomplete: {
    id: 'authoring.live.Incomplete',
    defaultMessage: 'Incomplete',
    description: 'A description for the second step of the app configuration stepper.',
  },
  saveButton: {
    id: 'authoring.discussions.saveButton',
    defaultMessage: 'Save',
    description: 'Button allowing the user to submit their discussion configuration.',
  },
  savingButton: {
    id: 'authoring.discussions.savingButton',
    defaultMessage: 'Saving',
    description: 'Button label when the discussion configuration is being submitted.',
  },
  savedButton: {
    id: 'authoring.discussions.savedButton',
    defaultMessage: 'Saved',
    description: 'Button label when the discussion configuration has been successfully submitted.',
  },
});

export default messages;
