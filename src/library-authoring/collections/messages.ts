import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  manageTabTitle: {
    id: 'course-authoring.library-authoring.collections-sidebar.manage-tab.title',
    defaultMessage: 'Manage',
    description: 'Title for manage tab',
  },
  detailsTabTitle: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.title',
    defaultMessage: 'Details',
    description: 'Title for details tab',
  },
  noComponentsInCollection: {
    id: 'course-authoring.library-authoring.collections-pag.no-components.text',
    defaultMessage: 'This collection is currently empty.',
    description: 'Text to display when collection has no associated components',
  },
  addComponentsInCollection: {
    id: 'course-authoring.library-authoring.collections-pag.add-components.btn-text',
    defaultMessage: 'New',
    description: 'Text to display in new button if no components in collection is found',
  },
  noSearchResultsInCollection: {
    id: 'course-authoring.library-authoring.collections-pag.no-search-results.text',
    defaultMessage: 'No matching components found in this collections.',
    description: 'Message displayed when no matching components are found in collection',
  },
});

export default messages;
