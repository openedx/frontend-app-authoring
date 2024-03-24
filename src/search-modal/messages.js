// @ts-check
import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = /** @type {<T>(x: T) => x} */(_defineMessages);

const messages = defineMessages({
  'courseSearch.title': {
    id: 'courseSearch.title',
    defaultMessage: 'Search',
    description: 'Title for the course search dialog',
  },
  'courseSearch.inputPlaceholder': {
    id: 'courseSearch.inputPlaceholder',
    defaultMessage: 'Search',
    description: 'Placeholder text shown in the keyword input field when the user has not yet entered a keyword',
  },
  'courseSearch.showMore': {
    id: 'courseSearch.showMore',
    defaultMessage: 'Show more',
    description: 'Show more tags / filter options',
  },
});

export default messages;
