// @ts-check
import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = /** @type {<T>(x: T) => x} */(_defineMessages);

const messages = defineMessages({
  'courseSearch.title': {
    id: 'courseSearch.title',
    defaultMessage: 'Search Course(s)',
    description: 'Title for the course search dialog',
  },
});

export default messages;
