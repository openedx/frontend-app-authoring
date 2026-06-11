import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  unsubscribeTitle: {
    id: 'release-notes.unsubscribe.title',
    defaultMessage: 'Unsubscribe from Release Notes',
  },
  unsubscribeConfirmation: {
    id: 'release-notes.unsubscribe.confirmation',
    defaultMessage: 'You will no longer receive email notifications when new edX.org Release Notes are published.',
  },
  unsubscribeButton: {
    id: 'release-notes.unsubscribe.button',
    defaultMessage: 'Unsubscribe',
  },
  unsubscribeDisclaimer: {
    id: 'release-notes.unsubscribe.disclaimer',
    defaultMessage: 'This only affects Release Notes emails. You will continue to receive other important account notifications.',
  },
  unsubscribeProcessing: {
    id: 'release-notes.unsubscribe.processing',
    defaultMessage: 'Processing your request...',
  },
  unsubscribeSuccessTitle: {
    id: 'release-notes.unsubscribe.success.title',
    defaultMessage: 'Successfully Unsubscribed',
  },
  unsubscribeSuccess: {
    id: 'release-notes.unsubscribe.success',
    defaultMessage: 'You have been successfully unsubscribed from future Release Notes announcements. You will no longer receive these emails.',
  },
  unsubscribeErrorTitle: {
    id: 'release-notes.unsubscribe.error.title',
    defaultMessage: 'Something Went Wrong',
  },
  unsubscribeError: {
    id: 'release-notes.unsubscribe.error',
    defaultMessage: 'We were unable to process your unsubscribe request. Please sign in with the account that received the email and try again.',
  },
  unsubscribeRetry: {
    id: 'release-notes.unsubscribe.retry',
    defaultMessage: 'Try Again',
  },
});

export default messages;
