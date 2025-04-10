import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  openCollectionButton: {
    id: 'course-authoring.library-authoring.collections-sidebbar.open-button',
    defaultMessage: 'Open',
    description: 'Button text to open collection',
  },
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
  detailsTabDescriptionTitle: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.description-title',
    defaultMessage: 'Description / Card Preview Text',
    description: 'Title for the Description container in the details tab',
  },
  detailsTabDescriptionPlaceholder: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.description-placeholder',
    defaultMessage: 'Add description',
    description: 'Placeholder for the Description container in the details tab',
  },
  detailsTabStatsTitle: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.stats-title',
    defaultMessage: 'Collection Stats',
    description: 'Title for the Collection Stats container in the details tab',
  },
  detailsTabStatsNoComponents: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.stats-no-components',
    defaultMessage: 'This collection is currently empty.',
    description: 'Message displayed when no components are found in the Collection Stats container',
  },
  detailsTabStatsTotalComponents: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.stats-total-components',
    defaultMessage: 'Total ',
    description: 'Label for total components in the Collection Stats container',
  },
  detailsTabStatsOtherComponents: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.stats-other-components',
    defaultMessage: 'Other',
    description: 'Label for other components in the Collection Stats container',
  },
  detailsTabHistoryTitle: {
    id: 'course-authoring.library-authoring.collections-sidebar.details-tab.history-title',
    defaultMessage: 'Collection History',
    description: 'Title for the Collection History container in the details tab',
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
    defaultMessage: 'No matching components found in this collection.',
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
  updateCollectionSuccessMsg: {
    id: 'course-authoring.library-authoring.update-collection-success-msg',
    defaultMessage: 'Collection updated successfully.',
    description: 'Message displayed when collection is updated successfully',
  },
  updateCollectionErrorMsg: {
    id: 'course-authoring.library-authoring.update-collection-error-msg',
    defaultMessage: 'Failed to update collection.',
    description: 'Message displayed when collection update fails',
  },
  editTitleButtonAlt: {
    id: 'course-authoring.library-authoring.collection.sidebar.edit-name.alt',
    defaultMessage: 'Edit collection title',
    description: 'Alt text for edit collection title icon button',
  },
  returnToLibrary: {
    id: 'course-authoring.library-authoring.collection.component-picker.return-to-library',
    defaultMessage: 'Back to Library',
    description: 'Breadcrumbs link to return to library',
  },
});

export default messages;
