import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  documentationPage: {
    id: 'authoring.discussions.documentationPage',
    defaultMessage: 'Visit the {name} documentation page',
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
  emailId: {
    id: 'authoring.discussions.appDocInstructions.emailID',
    defaultMessage: 'To get in touch with the team at {title} you may reach them at {link}.',
    description: 'Application Document Instructions message for email id',
  },
  documentation: {
    id: 'authoring.discussions.appDocInstructions.documentationLink',
    defaultMessage: 'General documentation for this tool can be found on {link}.',
    description: 'Application Document Instructions message for documentation link',
  },
  accessibilityDocumentation: {
    id: 'authoring.discussions.appDocInstructions.accessibilityDocumentationLink',
    defaultMessage: "Additional details on this tool's accessibility documentation can be found on {link}.",
    description: 'Application Document Instructions message for accessibility link',
  },
  configurationDocumentation: {
    id: 'authoring.discussions.appDocInstructions.configurationDocumentationLink',
    defaultMessage: 'Configuration documentation can be found on {link}.',
    description: 'Application Document Instructions message for configurations link',
  },
  learnMore: {
    id: 'authoring.discussions.appDocInstructions.learnMoreLink',
    defaultMessage: 'To learn more about {title} you can {link}.',
    description: 'Application Document Instructions message for learn more links',
  },
  reviewLinkText: {
    id: 'authoring.discussions.appDocInstructions.reviewLink',
    defaultMessage: 'review this page',
    description: 'learn more link text',
  },
  linkText: {
    id: 'authoring.discussions.appDocInstructions.linkText',
    defaultMessage: 'this page',
    description: 'general link text',
  },
});

export default messages;
