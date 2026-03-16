import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'authoring.pagesAndResources.live.enableLive.heading',
    defaultMessage: 'Configure Live',
    description: 'Heading for live configuration',
  },
  enableLiveLabel: {
    id: 'authoring.pagesAndResources.live.enableLive.label',
    defaultMessage: 'Live',
    description: 'Title for configuration',
  },
  enableLiveHelp: {
    id: 'authoring.pagesAndResources.live.enableLive.help',
    defaultMessage: 'Schedule meetings and conduct live course sessions with learners.',
    description: 'Tells the purpose of live configuration',
  },
  enableLiveLink: {
    id: 'authoring.pagesAndResources.live.enableLive.link',
    defaultMessage: 'Learn more about live',
    description: 'Link text that tells the user to learn about the live',
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
  selectProvider: {
    id: 'authoring.live.selectProvider',
    defaultMessage: 'Select a video conferencing tool',
    description: '',
  },
  formInstructions: {
    id: 'authoring.live.formInstructions',
    defaultMessage: 'Complete the fields below to set up your video conferencing tool.',
    description: 'Instruction for configure the video conferencing tool.',
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
  providerHelperText: {
    id: 'authoring.live.provider.helpText',
    defaultMessage: 'This configuration will require sharing username and emails of learners and the course team with {providerName}.',
    description: 'Tells the user that sharing username and email is required for configuration',
  },
  requestPiiSharingEnable: {
    id: 'authoring.live.requestPiiSharingEnable',
    defaultMessage: 'This configuration will require sharing usernames and emails of learners and the course team with {provider}. To access the LTI configuration for {provider}, please request your edX project coordinator to get PII sharing enabled for this course.',
    description: 'Tells the user that request edx project coordinator to enable the PII sharing to access the LTI configuration for a provider.',
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
  'appName-zoom': {
    id: 'authoring.live.appName-yellowdig',
    defaultMessage: 'Zoom',
    description: 'The name of the Zoom app.',
  },
  'appName-googleMeet': {
    id: 'authoring.live.appName-googleMeet',
    defaultMessage: 'Google Meet',
    description: 'The name of the Google Meet app.',
  },
  'appName-microsoftTeams': {
    id: 'authoring.live.appName-microsoftTeams',
    defaultMessage: 'Microsoft Teams',
    description: 'The name of the Microsoft Teams app.',
  },
  'appName-bigBlueButton': {
    id: 'authoring.live.appName-bigBlueButton',
    defaultMessage: 'BigBlueButton',
    description: 'The name of the Big Blue Button Teams app.',
  },
  requestPiiSharingEnableForBbb: {
    id: 'authoring.live.requestPiiSharingEnableForBbb',
    defaultMessage: 'This configuration will require sharing usernames of learners and the course team with {provider}.',
    description: 'Tells the user that they require sharing usernames with the provider to use this feature',
  },

  piiSharingEnableHelpTextBbb: {
    id: 'authoring.live.piiSharingEnableHelpText',
    defaultMessage: 'To enable this feature, contact your edX support team to enable PII sharing for this course.',
    description: 'Tells the user that request edx project coordinator to enable the PII sharing to access the LTI configuration for a provider.',
  },

  freePlanMessage: {
    id: 'authoring.live.freePlanMessage',
    defaultMessage: 'The free plan is pre-configured, and no additional configurations are required. By selecting the free plan, you are agreeing to Blindside Networks',
    description: 'Tells user that free plans requires no additional configurations',
  },
  privacyPolicy: {
    id: 'authoring.live.privacyPolicy',
    defaultMessage: 'Privacy Policy.',
    description: 'The text of privacy policy hyperlink for free plan',
  },
});

export default messages;
