import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  errorSavingTitle: {
    id: 'course-authoring.tree-table.error-saving.title',
    defaultMessage: 'Error saving changes',
  },
  errorSavingMessage: {
    id: 'course-authoring.tree-table.error-saving.message',
    defaultMessage: 'An error occurred while saving changes. Please try again.',
  },
  expandAll: {
    id: 'course-authoring.tree-table.expand-all',
    defaultMessage: 'Expand All',
  },
  collapseAll: {
    id: 'course-authoring.tree-table.collapse-all',
    defaultMessage: 'Collapse All',
  },
  noResultsFoundMessage: {
    id: 'course-authoring.tree-table.no-results-found.message',
    defaultMessage: 'No results found',
  },
  searchPlaceholder: {
    id: 'course-authoring.tree-table.search.placeholder',
    defaultMessage: 'Search...',
  },
  editTagInputLabel: {
    id: 'course-authoring.tree-table.edit-tag-input.label',
    defaultMessage: 'Type tag name',
  },
  cancelButtonLabel: {
    id: 'course-authoring.tree-table.cancel.button-label',
    defaultMessage: 'Cancel',
  },
  saveButtonLabel: {
    id: 'course-authoring.tree-table.save.button-label',
    defaultMessage: 'Save',
  },
  savingSpinnerScreenReaderText: {
    id: 'course-authoring.tree-table.saving-spinner.screen-reader-text',
    defaultMessage: 'Saving...',
  },
  tablePaginationLabel: {
    id: 'course-authoring.tree-table.pagination.label',
    defaultMessage: 'table pagination',
  },
  tablePaginationPageStatus: {
    id: 'course-authoring.tree-table.pagination.page-status',
    defaultMessage: 'Page {currentPage} of {pageCount}',
  },
});

export default messages;
