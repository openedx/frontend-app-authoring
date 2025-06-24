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
    defaultMessage: 'Delete {componentName}? {message}',
    description: 'Confirmation text to display before deleting a component',
  },
  deleteComponentConfirmCourse: {
    id: 'course-authoring.library-authoring.component.delete-confirmation-msg-1',
    defaultMessage: 'If this component has been used in a course, those copies won\'t be deleted, but they will no longer receive updates from the library.',
    description: 'First part of confirmation message to display before deleting a component',
  },
  deleteComponentConfirmCourseSmall: {
    id: 'course-authoring.library-authoring.component.delete-confirmation-text.course-small',
    defaultMessage: 'Any course instances will stop receiving library updates.',
    description: 'Small message text about courses when deleting a component',
  },
  deleteComponentConfirmUnits: {
    id: 'course-authoring.library-authoring.component.delete-confirmation-text.units',
    defaultMessage: 'By deleting this component, you will also be deleting it from {unit} in this library.',
    description: 'Message text about units when deleting a component',
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
    id: 'course-authoring.library-authoring.component-picker.single.title',
    defaultMessage: 'Add',
    description: 'Button title for picking a component',
  },
  componentPickerMultipleSelectTitle: {
    id: 'course-authoring.library-authoring.component-picker.multiple.title',
    defaultMessage: 'Select',
    description: 'Button title for selecting multiple components',
  },
  unpublishedChanges: {
    id: 'course-authoring.library-authoring.component.unpublished-changes',
    defaultMessage: 'Unpublished changes',
    description: 'Badge text shown when a component has unpublished changes',
  },
  publishConfirmationTitle: {
    id: 'course-authoring.library-authoring.component.publish-confirmation.title',
    defaultMessage: 'Publish {displayName}',
    description: 'Title of the modal to confirm publish a component in a library',
  },
  publishConfirmationButton: {
    id: 'course-authoring.library-authoring.component.publish-confirmation.confirm',
    defaultMessage: 'Publish',
    description: 'Text in confirmation button of the modal to confirm publish a component in a library',
  },
  publishConfirmationBody: {
    id: 'course-authoring.library-authoring.component.publish-confirmation.body',
    defaultMessage: 'Publish all unpublished changes for this component?',
    description: 'Body text of the modal to confirm publish a component in a library',
  },
  publishConfimrationDownstreamsBody: {
    id: 'course-authoring.library-authoring.component.publish-confirmation.downsteams-body',
    defaultMessage: 'This content is currently being used in:',
    description: 'Body text to show downstreams of the modal to confirm publish a component in a library',
  },
  publishConfirmationDownstreamsAlert: {
    id: 'course-authoring.library-authoring.component.publish-confirmation.downsteams-alert',
    defaultMessage: 'This component can be synced in courses after publish.',
    description: 'Alert text of the modal to confirm publish a component in a library.',
  },
  removeComponentFromUnitMenu: {
    id: 'course-authoring.library-authoring.unit.component.remove.button',
    defaultMessage: 'Remove from unit',
    description: 'Text of the menu item to remove a component from a unit',
  },
  removeComponentFromContainerSuccess: {
    id: 'course-authoring.library-authoring.component.remove-from-container-success',
    defaultMessage: 'Component successfully removed',
    description: 'Message for successful removal of a component from container.',
  },
  removeComponentFromContainerFailure: {
    id: 'course-authoring.library-authoring.component.remove-from-container-failure',
    defaultMessage: 'Failed to remove component',
    description: 'Message for failure of removal of a component from container.',
  },
  undoRemoveComponentFromContainerToastAction: {
    id: 'course-authoring.library-authoring.component.undo-remove-from-container-toast-button',
    defaultMessage: 'Undo',
    description: 'Toast message to undo remove a component from container.',
  },
  undoRemoveComponentFromContainerToastSuccess: {
    id: 'course-authoring.library-authoring.component.undo-remove-component-from-container-toast-text',
    defaultMessage: 'Undo successful',
    description: 'Message to display on undo delete component success',
  },
  undoRemoveComponentFromContainerToastFailed: {
    id: 'course-authoring.library-authoring.component.undo-remove-component-from-container-failed',
    defaultMessage: 'Failed to undo remove component operation',
    description: 'Message to display on failure to undo delete component',
  },
});
export default messages;
