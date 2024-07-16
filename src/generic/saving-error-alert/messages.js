import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  warningTitle: {
    id: 'course-authoring.generic.saving-error-alert.title',
    defaultMessage: 'Studio\'s having trouble saving your work',
    description: 'Title for an alert indicating saving error in the studio environment',
  },
  warningDescription: {
    id: 'course-authoring.generic.saving-error-alert.description',
    defaultMessage: 'This may be happening because of an error with our server or your internet connection. Try refreshing the page or making sure you are online.',
    description: 'Description providing possible reasons and solutions for saving error in the studio environment',
  },
});

export default messages;
