import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'authoring.discussions.heading',
    defaultMessage: 'Select a discussion tool for this course',
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
  appFullSupport: {
    id: 'authoring.discussions.appFullSupport',
    defaultMessage: 'Full support',
    description: 'A label indicating that an app supports the full set of possible features for a discussions app.',
  },
  appPartialSupport: {
    id: 'authoring.discussions.appPartialSupport',
    defaultMessage: 'Partial support',
    description: 'A label indicating that an app only supports a subset of the possible features of a discussions app.',
  },
  noApps: {
    id: 'authoring.discussions.noApps',
    defaultMessage: 'There are no discussions providers available for your course.',
    description: 'A message shown when there are no discussions providers available to be displayed.',
  },

  // Legacy
  'appName-legacy': {
    id: 'authoring.discussions.appName-legacy',
    defaultMessage: 'Legacy edX Discussions',
    description: 'The name of the Legacy edX Discussions app.',
  },
  'appDescription-legacy': {
    id: 'authoring.discussions.appDescription-legacy',
    defaultMessage: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
    description: 'A description of the Legacy edX Discussions app.',
  },
  // Piazza
  'appName-piazza': {
    id: 'authoring.discussions.appName-piazza',
    defaultMessage: 'Piazza',
    description: 'The name of the Piazza app.',
  },
  'appDescription-piazza': {
    id: 'authoring.discussions.appDescription-piazza',
    defaultMessage: 'Piazza is designed to connect students, TAs, and professors so every student can get the help they need when they need it.',
    description: 'A description of the Piazza app.',
  },

  // Features
  'featureName-discussion-page': {
    id: 'authoring.discussions.featureName-discussion-page',
    defaultMessage: 'Discussion Page',
    description: 'The name of a discussions feature.',
  },
  'featureName-embedded-course-sections': {
    id: 'authoring.discussions.featureName-embedded-course-sections',
    defaultMessage: 'Embedded Course Sections',
    description: 'The name of a discussions feature.',
  },
  'featureName-lti': {
    id: 'authoring.discussions.featureName-lti',
    defaultMessage: 'LTI Integration',
    description: 'The name of a discussions feature.',
  },
  'featureName-wcag-2.1': {
    id: 'authoring.discussions.featureName-wcag-2.1',
    defaultMessage: 'WCAG 2.1 Support',
    description: 'The name of a discussions feature.',
  },
});

export default messages;
