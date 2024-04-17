// @ts-check
import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = /** @type {import('react-intl').defineMessages} */(_defineMessages);

const messages = defineMessages({
  blockTypeFilter: {
    id: 'course-authoring.course-search.blockTypeFilter',
    defaultMessage: 'Type',
    description: 'Label for the filter that allows limiting results to a specific component type',
  },
  'blockTypeFilter.empty': {
    id: 'course-authoring.course-search.blockTypeFilter.empty',
    defaultMessage: 'No matching components',
    description: 'Label shown when there are no options available to filter by component type',
  },
  blockTagsFilter: {
    id: 'course-authoring.course-search.blockTagsFilter',
    defaultMessage: 'Tags',
    description: 'Label for the filter that allows finding components with specific tags',
  },
  'blockTagsFilter.empty': {
    id: 'course-authoring.course-search.blockTagsFilter.empty',
    defaultMessage: 'No tags in current results',
    description: 'Label shown when there are no options available to filter by tags',
  },
  'blockTagsFilter.error': {
    id: 'course-authoring.course-search.blockTagsFilter.error',
    defaultMessage: 'Error loading tags',
    description: 'Label shown when the tags could not be loaded',
  },
  'blockTagsFilter.incomplete': {
    id: 'course-authoring.course-search.blockTagsFilter.incomplete',
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
  childTagsExpand: {
    id: 'course-authoring.course-search.child-tags-expand',
    defaultMessage: 'Expand to show child tags of "{tagName}"',
    description: 'This text describes the ▼ expand toggle button to non-visual users.',
  },
  childTagsCollapse: {
    id: 'course-authoring.course-search.child-tags-collapse',
    defaultMessage: 'Collapse to hide child tags of "{tagName}"',
    description: 'This text describes the ▲ collapse toggle button to non-visual users.',
  },
  clearFilters: {
    id: 'course-authoring.course-search.clearFilters',
    defaultMessage: 'Clear Filters',
    description: 'Label for the button that removes all applied search filters',
  },
  numResults: {
    id: 'course-authoring.course-search.num-results',
    defaultMessage: '{numResults, plural, one {# result} other {# results}} found',
    description: 'This count displays how many matching results were found from the user\'s search',
  },
  searchAllCourses: {
    id: 'course-authoring.course-search.searchAllCourses',
    defaultMessage: 'All courses',
    description: 'Option to get search results from all courses.',
  },
  searchThisCourse: {
    id: 'course-authoring.course-search.searchThisCourse',
    defaultMessage: 'This course',
    description: 'Option to limit search results to the current course only.',
  },
  title: {
    id: 'course-authoring.course-search.title',
    defaultMessage: 'Search',
    description: 'Title for the course search dialog',
  },
  inputPlaceholder: {
    id: 'course-authoring.course-search.inputPlaceholder',
    defaultMessage: 'Search',
    description: 'Placeholder text shown in the keyword input field when the user has not yet entered a keyword',
  },
  searchTagsByKeywordPlaceholder: {
    id: 'course-authoring.course-search.searchTagsByKeywordPlaceholder',
    defaultMessage: 'Search tags',
    description: 'Placeholder text shown in the input field that allows searching through the available tags',
  },
  showMore: {
    id: 'course-authoring.course-search.showMore',
    defaultMessage: 'Show more',
    description: 'Show more tags / filter options',
  },
  showMoreResults: {
    id: 'course-authoring.course-search.showMoreResults',
    defaultMessage: 'Show more results',
    description: 'Show more results - a button to add to the list of results by loading more from the server',
  },
  loadingMoreResults: {
    id: 'course-authoring.course-search.loadingMoreResults',
    defaultMessage: 'Loading more results',
    description: 'Loading more results - the button displays this message while more results are loading',
  },
  emptySearchTitle: {
    id: 'course-authoring.course-search.emptySearchTitle',
    defaultMessage: 'Start searching to find content',
    description: 'Title shown when the user has not yet entered a keyword',
  },
  emptySearchSubtitle: {
    id: 'course-authoring.course-search.emptySearchSubtitle',
    defaultMessage: 'Find sections, subsections, units and components',
    description: 'Subtitle shown when the user has not yet entered a keyword',
  },
  noResultsTitle: {
    id: 'course-authoring.course-search.noResultsTitle',
    defaultMessage: 'We didn\'t find anything matching your search',
    description: 'Title shown when the search returned no results',
  },
  noResultsSubtitle: {
    id: 'course-authoring.course-search.noResultsSubtitle',
    defaultMessage: 'Please try a different search term or filter',
    description: 'Subtitle shown when the search returned no results',
  },
  openInNewWindow: {
    id: 'course-authoring.course-search.openInNewWindow',
    defaultMessage: 'Open in new window',
    description: 'Alt text for the button that opens the search result in a new window',
  },
});

export default messages;
