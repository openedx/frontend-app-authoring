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
  noApps: {
    id: 'authoring.discussions.noApps',
    defaultMessage: 'There are no discussions providers available for your course.',
    description: 'A message shown when there are no discussions providers available to be displayed.',
  },
  nextButton: {
    id: 'authoring.discussions.nextButton',
    defaultMessage: 'Next',
    description: 'Button allowing the user to advance to the second step of discussion configuration.',
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
  selectApp: {
    id: 'authoring.discussions.selectApp',
    defaultMessage: 'Select {appName}',
    description: 'A label for the checkbox that allows a user to select the discussions app they want to configure.',
  },

  // Legacy
  'appName-legacy': {
    id: 'authoring.discussions.appList.appName-legacy',
    defaultMessage: 'edX Discussions',
    description: 'The name of the Legacy edX Discussions app.',
  },
  'appDescription-legacy': {
    id: 'authoring.discussions.appList.appDescription-legacy',
    defaultMessage: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
    description: 'A description of the Legacy edX Discussions app.',
  },
  // Piazza
  'appName-piazza': {
    id: 'authoring.discussions.appList.appName-piazza',
    defaultMessage: 'Piazza',
    description: 'The name of the Piazza app.',
  },
  'appDescription-piazza': {
    id: 'authoring.discussions.appList.appDescription-piazza',
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
