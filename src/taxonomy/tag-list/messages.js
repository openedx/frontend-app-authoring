import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  noResultsFoundMessage: {
    id: 'course-authoring.tag-list.no-results-found.message',
    defaultMessage: 'No results found',
  },
  tagListColumnValueHeader: {
    id: 'course-authoring.tag-list.column.value.header',
    defaultMessage: 'Tag name',
  },
  tagListError: {
    id: 'course-authoring.tag-list.error',
    defaultMessage: 'Error: unable to load child tags',
  },
});

export default messages;
