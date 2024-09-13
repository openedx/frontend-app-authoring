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
  collectionType: {
    id: 'course-authoring.library-authoring.collection.type',
    defaultMessage: 'Collection',
    description: 'Collection type text',
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
});

export default messages;
