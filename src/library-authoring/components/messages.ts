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
  menuAddToCollection: {
    id: 'course-authoring.library-authoring.component.menu.add',
    defaultMessage: 'Add to collection',
    description: 'Menu item for add a component to collection.',
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
});

export default messages;
