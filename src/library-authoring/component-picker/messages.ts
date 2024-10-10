import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  selectLibraryInfo: {
    id: 'course-authoring.library-authoring.pick-components.select-library.info',
    defaultMessage: 'Select which Library would you like to reference components from.',
    description: 'The info text for the select library component',
  },
  selectLibrarySearchPlaceholder: {
    id: 'course-authoring.library-authoring.pick-components.select-library.search-placeholder',
    defaultMessage: 'Search for a library',
    description: 'The placeholder text for the search field in the select library component',
  },
  selectLibraryPaginationLabel: {
    id: 'course-authoring.library-authoring.pick-components.select-library.pagination-label',
    defaultMessage: 'Library pagination',
    description: 'The pagination label for the select library component',
  },
  selectLibraryEmptyStateTitle: {
    id: 'course-authoring.library-authoring.pick-components.select-library.empty-state.title',
    defaultMessage: 'We could not find any result',
    description: 'The title for the empty state in the select library component',
  },
  selectLibraryEmptyStateMessage: {
    id: 'course-authoring.library-authoring.pick-components.select-library.empty-state.message',
    defaultMessage: 'There are no libraries with the current filters.',
    description: 'The message for the empty state in the select library component',
  },
  selectLibraryNextButton: {
    id: 'course-authoring.library-authoring.pick-components.select-library.next-button',
    defaultMessage: 'Next',
    description: 'The text for the next button in the select library component',
  },
  pickComponentPreviousButton: {
    id: 'course-authoring.library-authoring.pick-components.previous-button',
    defaultMessage: 'Previous',
    description: 'The text for the previous button in the pick component component',
  },
});

export default messages;
