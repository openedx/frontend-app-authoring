import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';
import type { defineMessages as defineMessagesType } from 'react-intl';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = _defineMessages as typeof defineMessagesType;

const messages = defineMessages({
  clearFilters: {
    id: 'course-authoring.search-manager.clearFilters',
    defaultMessage: 'Clear Filters',
    description: 'Label for the button that removes all applied search filters',
  },
  inputPlaceholder: {
    id: 'course-authoring.search-manager.inputPlaceholder',
    defaultMessage: 'Search',
    description: 'Placeholder text shown in the keyword input field when the user has not yet entered a keyword',
  },
  blockTypeFilter: {
    id: 'course-authoring.search-manager.blockTypeFilter',
    defaultMessage: 'Type',
    description: 'Label for the filter that allows limiting results to a specific component type',
  },
  'blockTypeFilter.empty': {
    id: 'course-authoring.search-manager.blockTypeFilter.empty',
    defaultMessage: 'No matching components',
    description: 'Label shown when there are no options available to filter by component type',
  },
  childTagsExpand: {
    id: 'course-authoring.search-manager.child-tags-expand',
    defaultMessage: 'Expand to show child tags of "{tagName}"',
    description: 'This text describes the ▼ expand toggle button to non-visual users.',
  },
  childTagsCollapse: {
    id: 'course-authoring.search-manager.child-tags-collapse',
    defaultMessage: 'Collapse to hide child tags of "{tagName}"',
    description: 'This text describes the ▲ collapse toggle button to non-visual users.',
  },
  'blockTagsFilter.empty': {
    id: 'course-authoring.search-manager.blockTagsFilter.empty',
    defaultMessage: 'No tags in current results',
    description: 'Label shown when there are no options available to filter by tags',
  },
  'blockTagsFilter.error': {
    id: 'course-authoring.search-manager.blockTagsFilter.error',
    defaultMessage: 'Error loading tags',
    description: 'Label shown when the tags could not be loaded',
  },
  'blockTagsFilter.incomplete': {
    id: 'course-authoring.search-manager.blockTagsFilter.incomplete',
    defaultMessage: 'Sorry, not all tags could be loaded',
    description: 'Label shown when the system is not able to display all of the available tag options.',
  },
  blockTagsFilter: {
    id: 'course-authoring.search-manager.blockTagsFilter',
    defaultMessage: 'Tags',
    description: 'Label for the filter that allows finding components with specific tags',
  },
  searchTagsByKeywordPlaceholder: {
    id: 'course-authoring.search-manager.searchTagsByKeywordPlaceholder',
    defaultMessage: 'Search tags',
    description: 'Placeholder text shown in the input field that allows searching through the available tags',
  },
  submitSearchTagsByKeyword: {
    id: 'course-authoring.search-manager.submitSearchTagsByKeyword',
    defaultMessage: 'Submit tag keyword search',
    description: 'Text shown to screen reader users for the search button on the tags keyword search',
  },
  numResults: {
    id: 'course-authoring.course-search.num-results',
    defaultMessage: '{numResults, plural, one {# result} other {# results}} found',
    description: 'This count displays how many matching results were found from the user\'s search',
  },
  clearFilter: {
    id: 'course-authoring.search-manager.searchFilterWidget.clearFilter',
    defaultMessage: 'Clear Filter',
    description: 'Label for the button that removes applied search filters in a specific widget',
  },
});

export default messages;
