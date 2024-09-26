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
  newContentButton: {
    id: 'course-authoring.library-authoring.collections.buttons.new-content.text',
    defaultMessage: 'New',
    description: 'Text of button to open "Add content drawer" in collections page',
  },
  collectionInfoButton: {
    id: 'course-authoring.library-authoring.buttons.collection-info.alt-text',
    defaultMessage: 'Collection Info',
    description: 'Alt text for collection info button besides the collection title',
  },
  readOnlyBadge: {
    id: 'course-authoring.library-authoring.collections.badge.read-only',
    defaultMessage: 'Read Only',
    description: 'Text in badge when the user has read only access in collections page',
  },
  allCollections: {
    id: 'course-authoring.library-authoring.all-collections.text',
    defaultMessage: 'All Collections',
    description: 'Breadcrumbs text to navigate back to all collections',
  },
  breadcrumbsAriaLabel: {
    id: 'course-authoring.library-authoring.breadcrumbs.label.text',
    defaultMessage: 'Navigation breadcrumbs',
    description: 'Aria label for navigation breadcrumbs',
  },
  searchPlaceholder: {
    id: 'course-authoring.library-authoring.search.placeholder.text',
    defaultMessage: 'Search Collection',
    description: 'Search placeholder text in collections page.',
  },
  noSearchResultsCollections: {
    id: 'course-authoring.library-authoring.no-search-results-collections',
    defaultMessage: 'No matching collections found in this library.',
    description: 'Message displayed when no matching collections are found',
  },
  noCollections: {
    id: 'course-authoring.library-authoring.no-collections',
    defaultMessage: 'You have not added any collections to this library yet.',
    description: 'Message displayed when the library has no collections',
  },
  addCollection: {
    id: 'course-authoring.library-authoring.add-collection',
    defaultMessage: 'Add collection',
    description: 'Button text to add a new collection',
  },
});

export default messages;
