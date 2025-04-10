import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  copying: {
    id: 'copypaste.copying',
    defaultMessage: 'Copying',
    description: 'Message shown when copying content to clipboard',
  },
  done: {
    id: 'copypaste.done',
    defaultMessage: 'Copied to clipboard',
    description: 'Message shown when content is copied to clipboard',
  },
  error: {
    id: 'copypaste.error',
    defaultMessage: 'Error copying to clipboard',
    description: 'Message shown when an error occurs while copying content to clipboard',
  },
});

export default messages;
