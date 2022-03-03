import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  formInstructions: {
    id: 'authoring.live.formInstructions',
    defaultMessage: 'Complete the fields below to set up your video conferencing tool.',
  },
  consumerKey: {
    id: 'authoring.live.consumerKey',
    defaultMessage: 'Consumer Key',
    description: 'Label for the Consumer Key field.',
  },
  consumerKeyRequired: {
    id: 'authoring.live.consumerKey.required',
    defaultMessage: 'Consumer key is a required field',
    description: 'Tells the user that the Consumer Key field is required and must have a value.',
  },
  consumerSecret: {
    id: 'authoring.live.consumerSecret',
    defaultMessage: 'Consumer Secret',
    description: 'Label for the Consumer Secret field.',
  },
  consumerSecretRequired: {
    id: 'authoring.live.consumerSecret.required',
    defaultMessage: 'Consumer secret is a required field',
    description: 'Tells the user that the Consumer Secret field is required and must have a value.',
  },
  launchUrl: {
    id: 'authoring.live.launchUrl',
    defaultMessage: 'Launch URL',
    description: 'Label for the Launch URL field.',
  },
  launchUrlRequired: {
    id: 'authoring.live.launchUrl.required',
    defaultMessage: 'Launch URL is a required field',
    description: 'Tells the user that the Launch URL field is required and must have a value.',
  },
  launchEmail: {
    id: 'authoring.live.launchEmail',
    defaultMessage: 'Launch Email',
    description: 'Label for the Launch Email field.',
  },
  launchEmailRequired: {
    id: 'authoring.live.launchEmail.required',
    defaultMessage: 'Launch Email is a required field',
    description: 'Tells the user that the Launch Email field is required and must have a value.',
  },
  helperText: {
    id: 'authoring.live.helpText',
    defaultMessage: 'This configuration will require sharing username and emails of learners and the course team with Zoom',
  },
  piiSharing: {
    id: 'authoring.live.piiSharing',
    defaultMessage: 'Optionally share a user\'s username and/or email with the LTI provider:',
  },
  piiShareUsername: {
    id: 'authoring.live.piiShareUsername',
    defaultMessage: 'Share username',
    description: 'Label for the Share Username field.',
  },
  piiShareEmail: {
    id: 'authoring.live.piiShareEmail',
    defaultMessage: 'Share email',
    description: 'Label for the Share Email field.',
  },
  general: {
    id: 'authoring.live.appDocInstructions.documentationLink',
    defaultMessage: 'General documentation',
    description: 'Application Document Instructions message for documentation link',
  },
  accessibility: {
    id: 'authoring.live.appDocInstructions.accessibilityDocumentationLink',
    defaultMessage: 'Accessibility documentation',
    description: 'Application Document Instructions message for accessibility link',
  },
  configuration: {
    id: 'authoring.live.appDocInstructions.configurationLink',
    defaultMessage: 'Configuration documentation',
    description: 'Application Document Instructions message for configurations link',
  },
  learnMore: {
    id: 'authoring.live.appDocInstructions.learnMoreLink',
    defaultMessage: 'Learn more about {providerName}',
    description: 'Application Document Instructions message for learn more links',
  },
  linkTextHeading: {
    id: 'authoring.live.appDocInstructions.linkTextHeading',
    defaultMessage: 'External help and documentation',
    description: 'External help and documentation heading',
  },
  linkText: {
    id: 'authoring.live.appDocInstructions.linkText',
    defaultMessage: '{link}',
    description: 'link',
  },
});

export default messages;
