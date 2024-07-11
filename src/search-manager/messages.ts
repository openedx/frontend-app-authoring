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
  'blockType.annotatable': {
    id: 'course-authoring.course-search.blockType.annotatable',
    defaultMessage: 'Annotation',
    description: 'Name of the "Annotation" component type in Studio',
  },
  'blockType.chapter': {
    id: 'course-authoring.course-search.blockType.chapter',
    defaultMessage: 'Section',
    description: 'Name of the "Section" course outline level in Studio',
  },
  'blockType.discussion': {
    id: 'course-authoring.course-search.blockType.discussion',
    defaultMessage: 'Discussion',
    description: 'Name of the "Discussion" component type in Studio',
  },
  'blockType.drag-and-drop-v2': {
    id: 'course-authoring.course-search.blockType.drag-and-drop-v2',
    defaultMessage: 'Drag and Drop',
    description: 'Name of the "Drag and Drop" component type in Studio',
  },
  'blockType.html': {
    id: 'course-authoring.course-search.blockType.html',
    defaultMessage: 'Text',
    description: 'Name of the "Text" component type in Studio',
  },
  'blockType.library_content': {
    id: 'course-authoring.course-search.blockType.library_content',
    defaultMessage: 'Library Content',
    description: 'Name of the "Library Content" component type in Studio',
  },
  'blockType.openassessment': {
    id: 'course-authoring.course-search.blockType.openassessment',
    defaultMessage: 'Open Response Assessment',
    description: 'Name of the "Open Response Assessment" component type in Studio',
  },
  'blockType.problem': {
    id: 'course-authoring.course-search.blockType.problem',
    defaultMessage: 'Problem',
    description: 'Name of the "Problem" component type in Studio',
  },
  'blockType.sequential': {
    id: 'course-authoring.course-search.blockType.sequential',
    defaultMessage: 'Subsection',
    description: 'Name of the "Subsection" course outline level in Studio',
  },
  'blockType.vertical': {
    id: 'course-authoring.course-search.blockType.vertical',
    defaultMessage: 'Unit',
    description: 'Name of the "Unit" course outline level in Studio',
  },
  'blockType.video': {
    id: 'course-authoring.course-search.blockType.video',
    defaultMessage: 'Video',
    description: 'Name of the "Video" component type in Studio',
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
  searchSortWidgetAltTitle: {
    id: 'course-authoring.course-search.searchSortWidget.title',
    defaultMessage: 'Sort search results',
    description: 'Alt/title text for the content search sort drop-down menu',
  },
  searchSortRelevance: {
    id: 'course-authoring.course-search.searchSort.relevance',
    defaultMessage: 'Most Relevant',
    description: 'Label for the content search sort drop-down which sorts by keyword relevance',
  },
  searchSortTitleAZ: {
    id: 'course-authoring.course-search.searchSort.titleAZ',
    defaultMessage: 'Title, A-Z',
    description: 'Label for the content search sort drop-down which sorts by content title, ascending',
  },
  searchSortTitleZA: {
    id: 'course-authoring.course-search.searchSort.titleZA',
    defaultMessage: 'Title, Z-A',
    description: 'Label for the content search sort drop-down which sorts by content title, descending',
  },
  searchSortNewest: {
    id: 'course-authoring.course-search.searchSort.newest',
    defaultMessage: 'Newest',
    description: 'Label for the content search sort drop-down which sorts by creation date, descending',
  },
  searchSortOldest: {
    id: 'course-authoring.course-search.searchSort.oldest',
    defaultMessage: 'Oldest',
    description: 'Label for the content search sort drop-down which sorts by creation date, ascending',
  },
  searchSortRecentlyPublished: {
    id: 'course-authoring.course-search.searchSort.recentlyPublished',
    defaultMessage: 'Recently Published',
    description: 'Label for the content search sort drop-down which sorts by published date, descending',
  },
  searchSortRecentlyModified: {
    id: 'course-authoring.course-search.searchSort.recentlyModified',
    defaultMessage: 'Recently Modified',
    description: 'Label for the content search sort drop-down which sorts by modified date, descending',
  },
});

export default messages;
