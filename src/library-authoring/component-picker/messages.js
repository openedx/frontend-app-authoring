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
  selectLibraryNoSearchResultsTitle: {
    id: 'course-authoring.library-authoring.pick-components.select-library.no-search.results.title',
    defaultMessage: 'We could not find any result',
    description: 'The title for the no search results state in the select library component',
  },
  selectLibraryNoSearchResultsMessage: {
    id: 'course-authoring.library-authoring.pick-components.select-library.no-search.message',
    defaultMessage: 'There are no libraries with the current filters.',
    description: 'The message for the no search results state in the select library component',
  },
  selectLibraryNoLibrariesTitle: {
    id: 'course-authoring.library-authoring.pick-components.select-library.no-libraries.title',
    defaultMessage: 'No libraries found',
    description: 'The title for the no libraries state in the select library component',
  },
  selectLibraryNoLibrariesMessage: {
    id: 'course-authoring.library-authoring.pick-components.select-library.no-libraries.message',
    defaultMessage: 'You don\'t have any libraries created yet, or you don\'t have access to any libraries. To '
      + 'create a new library, go to Studio Home or contact your system administrator.',
    description: 'The message for the no libraries state in the select library component',
  },
  selectLibraryNextButton: {
    id: 'course-authoring.library-authoring.pick-components.select-library.next-button',
    defaultMessage: 'Next',
    description: 'The text for the next button in the select library component',
  },
  pickerInfoBanner: {
    id: 'course-authoring.library-authoring.pick-components.component-picker.information-alert',
    defaultMessage: 'Only published content is visible and available for reuse.',
    description: 'The alert text on top of component-picker if only published content is visible.',
  },
});

export default messages;
