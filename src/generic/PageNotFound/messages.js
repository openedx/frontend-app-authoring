import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'pageNotFound.title',
    defaultMessage: 'Page Not Found',
    description: 'Title for the 404 error page',
  },
  description: {
    id: 'pageNotFound.description',
    defaultMessage: 'Sorry, the page you are looking for doesn\'t exist or has been moved.',
    description: 'Description message for the 404 error page',
  },
  goHome: {
    id: 'pageNotFound.goHome',
    defaultMessage: 'Go to Dashboard',
    description: 'Button text to navigate back to the dashboard',
  },
  goBack: {
    id: 'pageNotFound.goBack',
    defaultMessage: 'Go Back',
    description: 'Button text to go back to the previous page',
  },
  help: {
    id: 'pageNotFound.help',
    defaultMessage: 'If you believe this is an error, please contact support.',
    description: 'Help text for the 404 error page',
  },
});

export default messages;
