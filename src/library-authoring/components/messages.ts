import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  componentCardMenuAlt: {
    id: 'course-authoring.library-authoring.component.menu',
    defaultMessage: 'Component actions menu',
    description: 'Alt/title text for the component card menu button.',
  },
  collectionCardMenuAlt: {
    id: 'course-authoring.library-authoring.collection.menu',
    defaultMessage: 'Collection actions menu',
    description: 'Alt/title text for the collection card menu button.',
  },
  menuOpen: {
    id: 'course-authoring.library-authoring.collection.menu.open',
    defaultMessage: 'Open',
    description: 'Menu item for open a collection.',
  },
  menuEdit: {
    id: 'course-authoring.library-authoring.component.menu.edit',
    defaultMessage: 'Edit',
    description: 'Menu item for edit a component.',
  },
  menuCopyToClipboard: {
    id: 'course-authoring.library-authoring.component.menu.copy',
    defaultMessage: 'Copy to clipboard',
    description: 'Menu item for copy a component.',
  },
  menuDelete: {
    id: 'course-authoring.library-authoring.component.menu.delete',
    defaultMessage: 'Delete',
    description: 'Menu item for deleting a component.',
  },
  menuAddToCollection: {
    id: 'course-authoring.library-authoring.component.menu.add',
    defaultMessage: 'Add to collection',
    description: 'Menu item for add a component to collection.',
  },
  menuRemoveFromCollection: {
    id: 'course-authoring.library-authoring.component.menu.remove',
    defaultMessage: 'Remove from collection',
    description: 'Menu item for remove a component from collection.',
  },
  removeComponentSucess: {
    id: 'course-authoring.library-authoring.component.remove-from-collection-success',
    defaultMessage: 'Component successfully removed',
    description: 'Message for successful removal of component from collection.',
  },
  removeComponentFailure: {
    id: 'course-authoring.library-authoring.component.remove-from-collection-failure',
    defaultMessage: 'Failed to remove Component',
    description: 'Message for failure of removal of component from collection.',
  },
  copyToClipboardSuccess: {
    id: 'course-authoring.library-authoring.component.copyToClipboardSuccess',
    defaultMessage: 'Component copied to clipboard',
    description: 'Message for successful copy component to clipboard.',
  },
  copyToClipboardError: {
    id: 'course-authoring.library-authoring.component.copyToClipboardError',
    defaultMessage: 'Failed to copy component to clipboard',
    description: 'Message for failed to copy component to clipboard.',
  },
  deleteComponentWarningTitle: {
    id: 'course-authoring.library-authoring.component.delete-confirmation-title',
    defaultMessage: 'Delete Component',
    description: 'Title text for the warning displayed before deleting a component',
  },
  deleteComponentNamePlaceholder: {
    id: 'course-authoring.library-authoring.component.delete-confirmation-placeholder',
    defaultMessage: 'this component',
    description: 'Text shown in place of the component\'s title while we\'re loading the title',
  },
  deleteComponentConfirm: {
    id: 'course-authoring.library-authoring.component.delete-confirmation-text',
    defaultMessage: 'Delete {componentName}? If this component has been used in a course, those copies won\'t be deleted, but they will no longer receive updates from the library.',
    description: 'Confirmation text to display before deleting a component',
  },
  deleteComponentCancelButton: {
    id: 'course-authoring.library-authoring.component.cancel-delete-button',
    defaultMessage: 'Cancel',
    description: 'Button to cancel deletion of a component',
  },
  deleteComponentButton: {
    id: 'course-authoring.library-authoring.component.confirm-delete-button',
    defaultMessage: 'Delete',
    description: 'Button to confirm deletion of a component',
  },
  deleteComponentSuccess: {
    id: 'course-authoring.library-authoring.component.delete-error-success',
    defaultMessage: 'Component deleted',
    description: 'Message to display on delete component success',
  },
  undoDeleteComponentToastAction: {
    id: 'course-authoring.library-authoring.component.undo-delete-component-toast-button',
    defaultMessage: 'Undo',
    description: 'Toast message to undo deletion of component',
  },
  undoDeleteComponentToastSuccess: {
    id: 'course-authoring.library-authoring.component.undo-delete-component-toast-text',
    defaultMessage: 'Undo successful',
    description: 'Message to display on undo delete component success',
  },
  undoDeleteComponentToastFailed: {
    id: 'course-authoring.library-authoring.component.undo-delete-component-failed',
    defaultMessage: 'Failed to undo delete component operation',
    description: 'Message to display on failure to undo delete component',
  },
  deleteCollection: {
    id: 'course-authoring.library-authoring.collection.delete-menu-text',
    defaultMessage: 'Delete',
    description: 'Menu item to delete a collection.',
  },
  deleteCollectionConfirm: {
    id: 'course-authoring.library-authoring.collection.delete-confirmation-text',
    defaultMessage: 'Are you sure you want to delete collection: {collectionTitle}?',
    description: 'Confirmation text to display before deleting collection',
  },
  deleteCollectionFailed: {
    id: 'course-authoring.library-authoring.collection.delete-failed-error',
    defaultMessage: 'Failed to delete collection',
    description: 'Message to display on failure to delete collection',
  },
  deleteCollectionSuccess: {
    id: 'course-authoring.library-authoring.collection.delete-error-success',
    defaultMessage: 'Collection deleted',
    description: 'Message to display on delete collection success',
  },
  undoDeleteCollectionToastAction: {
    id: 'course-authoring.library-authoring.collection.undo-delete-collection-toast-button',
    defaultMessage: 'Undo',
    description: 'Toast message to undo deletion of collection',
  },
  undoDeleteCollectionToastMessage: {
    id: 'course-authoring.library-authoring.collection.undo-delete-collection-toast-text',
    defaultMessage: 'Undo successful',
    description: 'Message to display on undo delete collection success',
  },
  undoDeleteCollectionToastFailed: {
    id: 'course-authoring.library-authoring.collection.undo-delete-collection-failed',
    defaultMessage: 'Failed to undo delete collection operation',
    description: 'Message to display on failure to undo delete collection',
  },
  componentPickerSingleSelectTitle: {
    id: 'course-authoring.library-authoring.component-picker.single..title',
    defaultMessage: 'Add',
    description: 'Button title for picking a component',
  },
  componentPickerMultipleSelectTitle: {
    id: 'course-authoring.library-authoring.component-picker.multiple.title',
    defaultMessage: 'Select',
    description: 'Button title for selecting multiple components',
  },
});

export default messages;
