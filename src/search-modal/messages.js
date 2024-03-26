// @ts-check
import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = /** @type {import('react-intl').defineMessages} */(_defineMessages);

const messages = defineMessages({
  'courseSearch.blockTypeFilter': {
    id: 'courseSearch.blockTypeFilter',
    defaultMessage: 'Type',
    description: 'Label for the filter that allows limiting results to a specific component type',
  },
  'courseSearch.blockTypeFilter.empty': {
    id: 'courseSearch.blockTypeFilter.empty',
    defaultMessage: 'No matching components',
    description: 'Label shown when there are no options available to filter by component type',
  },
  'courseSearch.blockTagsFilter': {
    id: 'courseSearch.blockTagsFilter',
    defaultMessage: 'Tags',
    description: 'Label for the filter that allows finding components with specific tags',
  },
  'courseSearch.blockTagsFilter.empty': {
    id: 'courseSearch.blockTagsFilter.empty',
    defaultMessage: 'No tags in current results',
    description: 'Label shown when there are no options available to filter by tags',
  },
  'courseSearch.blockType.annotatable': {
    id: 'courseSearch.blockType.annotatable',
    defaultMessage: 'Annotation',
    description: 'Name of the "Annotation" component type in Studio',
  },
  'courseSearch.blockType.chapter': {
    id: 'courseSearch.blockType.chapter',
    defaultMessage: 'Section',
    description: 'Name of the "Section" course outline level in Studio',
  },
  'courseSearch.blockType.discussion': {
    id: 'courseSearch.blockType.discussion',
    defaultMessage: 'Discussion',
    description: 'Name of the "Discussion" component type in Studio',
  },
  'courseSearch.blockType.drag-and-drop-v2': {
    id: 'courseSearch.blockType.drag-and-drop-v2',
    defaultMessage: 'Drag and Drop',
    description: 'Name of the "Drag and Drop" component type in Studio',
  },
  'courseSearch.blockType.html': {
    id: 'courseSearch.blockType.html',
    defaultMessage: 'Text',
    description: 'Name of the "Text" component type in Studio',
  },
  'courseSearch.blockType.library_content': {
    id: 'courseSearch.blockType.library_content',
    defaultMessage: 'Library Content',
    description: 'Name of the "Library Content" component type in Studio',
  },
  'courseSearch.blockType.openassessment': {
    id: 'courseSearch.blockType.openassessment',
    defaultMessage: 'Open Response Assessment',
    description: 'Name of the "Open Response Assessment" component type in Studio',
  },
  'courseSearch.blockType.problem': {
    id: 'courseSearch.blockType.problem',
    defaultMessage: 'Problem',
    description: 'Name of the "Problem" component type in Studio',
  },
  'courseSearch.blockType.sequential': {
    id: 'courseSearch.blockType.sequential',
    defaultMessage: 'Subsection',
    description: 'Name of the "Subsection" course outline level in Studio',
  },
  'courseSearch.blockType.vertical': {
    id: 'courseSearch.blockType.vertical',
    defaultMessage: 'Unit',
    description: 'Name of the "Unit" course outline level in Studio',
  },
  'courseSearch.blockType.video': {
    id: 'courseSearch.blockType.video',
    defaultMessage: 'Video',
    description: 'Name of the "Video" component type in Studio',
  },
  'courseSearch.clearFilters': {
    id: 'courseSearch.clearFilters',
    defaultMessage: 'Clear Filters',
    description: 'Label for the button that removes all applied search filters',
  },
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
