import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  offlineWarningTitle: {
    id: 'course-authoring.generic.alert.warning.offline.title',
    defaultMessage: 'Studio\'s having trouble saving your work',
  },
  offlineWarningDescription: {
    id: 'course-authoring.generic.alert.warning.offline.description',
    defaultMessage: 'This may be happening because of an error with our server or your internet connection. Try refreshing the page or making sure you are online.',
  },
});

export default messages;
