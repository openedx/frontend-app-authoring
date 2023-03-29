import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  loading: {
    id: 'authoring.texteditor.title.loading',
    defaultMessage: 'Loading...',
    description: 'Message displayed while loading content',
  },
  cancelChangesLabel: {
    id: 'authoring.texteditor.header.cancelChangesLabel',
    defaultMessage: 'Cancel Changes and Return to Learning Context',
    description: 'Screen reader label title for icon button to return to learning context',
  },
  editTitleLabel: {
    id: 'authoring.texteditor.header.editTitleLabel',
    defaultMessage: 'Edit Title',
    description: 'Screen reader label title for icon button to edit the xblock title',
  },
  cancelTitleEdit: {
    id: 'authoring.texteditor.header.cancelTitleEdit',
    defaultMessage: 'Cancel',
    description: 'Screen reader label title for icon button to edit the xblock title',
  },
  saveTitleEdit: {
    id: 'authoring.texteditor.header.saveTitleEdit',
    defaultMessage: 'Save',
    description: 'Screen reader label title for icon button to edit the xblock title',
  },
});

export default messages;
