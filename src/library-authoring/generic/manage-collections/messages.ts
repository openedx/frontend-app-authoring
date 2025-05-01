import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  manageCollectionsText: {
    id: 'course-authoring.library-authoring.manage-collections.title',
    defaultMessage: 'Manage Collections',
    description: 'Header and button text for the manage collection widget',
  },
  manageCollectionsAddBtnText: {
    id: 'course-authoring.library-authoring.manage-collections.btn-text',
    defaultMessage: 'Add to Collection',
    description: 'Button text for collection section in the manage collections widget',
  },
  manageCollectionsSearchPlaceholder: {
    id: 'course-authoring.library-authoring.manage-collections.search-placeholder',
    defaultMessage: 'Search',
    description: 'Placeholder text for collection search in the manage collections widget',
  },
  manageCollectionsSelectionLabel: {
    id: 'course-authoring.library-authoring.manage-collections.selection-aria-label',
    defaultMessage: 'Collection selection',
    description: 'Aria label text for collection selection box',
  },
  manageCollectionsToComponentConfirmBtn: {
    id: 'course-authoring.library-authoring.manage-collections.add-confirm-btn',
    defaultMessage: 'Confirm',
    description: 'Button text to confirm adding collections for an item',
  },
  manageCollectionsToComponentCancelBtn: {
    id: 'course-authoring.library-authoring.manage-collections.add-cancel-btn',
    defaultMessage: 'Cancel',
    description: 'Button text to cancel collections selection for am item',
  },
  componentNotOrganizedIntoCollection: {
    id: 'course-authoring.library-authoring.manage-collections.no-collections',
    defaultMessage: 'This item is not organized into any collection.',
    description: 'Message to display in the manage collections widget when an item is not part of any collection.',
  },
});

export default messages;
