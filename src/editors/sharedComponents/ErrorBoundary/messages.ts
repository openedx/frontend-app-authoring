import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  unexpectedError: {
    id: 'unexpected.error.message.text',
    defaultMessage: 'An unexpected error occurred. Please click the button below to refresh the page.',
    description: 'error message when an unexpected error occurs',
  },
  unexpectedErrorButtonLabel: {
    id: 'unexpected.error.button.text',
    defaultMessage: 'Try again',
    description: 'text for button that tries to reload the app by refreshing the page',
  },
  returnToUnitPageLabel: {
    id: 'unexpected.error.returnToUnitPage.button.text',
    defaultMessage: 'Return to unit page',
    description: 'Text for button that navigates back to the unit page',
  },
  returnToOutlineLabel: {
    id: 'unexpected.error.returnToCourseOutline.button.text',
    defaultMessage: 'Return to {outlineType} outline',
    description: 'Text for button that navigates back to the course outline',
  },
});

export default messages;
