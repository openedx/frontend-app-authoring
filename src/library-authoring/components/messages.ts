import { defineMessages as _defineMessages } from '@edx/frontend-platform/i18n';
import type { defineMessages as defineMessagesType } from 'react-intl';

// frontend-platform currently doesn't provide types... do it ourselves.
const defineMessages = _defineMessages as typeof defineMessagesType;

const messages = defineMessages({
  menuEdit: {
    id: 'course-authoring.library-authoring.component.menu.edit',
    defaultMessage: 'Edit',
    description: 'Menu item for edit a component.',
  },
  menuCopyToClipboard: {
    id: 'course-authoring.library-authoring.component.menu.copy',
    defaultMessage: 'Copy to Clipboard',
    description: 'Menu item for copy a component.',
  },
  menuAddToCollection: {
    id: 'course-authoring.library-authoring.component.menu.add',
    defaultMessage: 'Add to Collection',
    description: 'Menu item for add a component to collection.',
  },
});

export default messages;
