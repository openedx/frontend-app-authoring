import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  documentationPage: {
    id: 'authoring.discussions.documentationPage',
    defaultMessage: 'Visit the {name} documentation page',
  },
  formInstructions: {
    id: 'authoring.discussions.formInstructions',
    defaultMessage: 'Complete the fields below to set up your discussion tool.',
  },
  consumerKey: {
    id: 'authoring.discussions.consumerKey',
    defaultMessage: 'Consumer Key',
    description: 'Label for the Consumer Key field.',
  },
  consumerKeyRequired: {
    id: 'authoring.discussions.consumerKey.required',
    defaultMessage: 'Consumer key is a required field',
    description: 'Tells the user that the Consumer Key field is required and must have a value.',
  },
  consumerSecret: {
    id: 'authoring.discussions.consumerSecret',
    defaultMessage: 'Consumer Secret',
    description: 'Label for the Consumer Secret field.',
  },
  consumerSecretRequired: {
    id: 'authoring.discussions.consumerSecret.required',
    defaultMessage: 'Consumer secret is a required field',
    description: 'Tells the user that the Consumer Secret field is required and must have a value.',
  },
  launchUrl: {
    id: 'authoring.discussions.launchUrl',
    defaultMessage: 'Launch URL',
    description: 'Label for the Launch URL field.',
  },
  launchUrlRequired: {
    id: 'authoring.discussions.launchUrl.required',
    defaultMessage: 'Launch URL is a required field',
    description: 'Tells the user that the Launch URL field is required and must have a value.',
  },
  staffOnlyConfigInfo: {
    id: 'authoring.discussions.stuffOnlyConfigInfo',
    defaultMessage: 'To enable {providerName} for your course, please contact their support team at {supportEmail} to learn more about pricing and usage.',
  },
  staffOnlyConfigGuide: {
    id: 'authoring.discussions.stuffOnlyConfigGuide',
    defaultMessage: 'To fully configure {providerName} will also require sharing usernames and emails for learners and course team. Please contact your edX project coordinator to enable PII sharing for this course.',
  },
  piiSharing: {
    id: 'authoring.discussions.piiSharing',
    defaultMessage: 'Optionally share a user\'s username and/or email with the LTI provider:',
  },
  piiShareUsername: {
    id: 'authoring.discussions.piiShareUsername',
    defaultMessage: 'Share username',
    description: 'Label for the Share Username field.',
  },
  piiShareEmail: {
    id: 'authoring.discussions.piiShareEmail',
    defaultMessage: 'Share email',
    description: 'Label for the Share Email field.',
  },
  contact: {
    id: 'authoring.discussions.appDocInstructions.contact',
    defaultMessage: 'Contact: {link}',
    description: 'Contact',
  },
  general: {
    id: 'authoring.discussions.appDocInstructions.documentationLink',
    defaultMessage: 'General documentation',
    description: 'Application Document Instructions message for documentation link',
  },
  accessibility: {
    id: 'authoring.discussions.appDocInstructions.accessibilityDocumentationLink',
    defaultMessage: 'Accessibility documentation',
    description: 'Application Document Instructions message for accessibility link',
  },
  configuration: {
    id: 'authoring.discussions.appDocInstructions.configurationLink',
    defaultMessage: 'Configuration documentation',
    description: 'Application Document Instructions message for configurations link',
  },
  learnMore: {
    id: 'authoring.discussions.appDocInstructions.learnMoreLink',
    defaultMessage: 'Learn more about {providerName}',
    description: 'Application Document Instructions message for learn more links',
  },
  linkTextHeading: {
    id: 'authoring.discussions.appDocInstructions.linkTextHeading',
    defaultMessage: 'External help and documentation',
    description: 'External help and documentation heading',
  },
  linkText: {
    id: 'authoring.discussions.appDocInstructions.linkText',
    defaultMessage: '{link}',
    description: 'link',
  },
});

export default messages;
