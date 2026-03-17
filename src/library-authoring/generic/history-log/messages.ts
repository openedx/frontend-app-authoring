import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  draftTitle: {
    id: 'course-authoring.library-authoring.history.draft.title',
    defaultMessage: '{displayName} is a draft',
    description: 'Title for the draft group in the history log section.',
  },
  draftTitleDate: {
    id: 'course-authoring.library-authoring.history.draft.date',
    defaultMessage: '{count, plural, one {{count} change} other {{count} changes}} sinde {date}',
    description: 'Title for the draft group in the history log section.',
  },
  createdComponentTitle: {
    id: 'course-authoring.library-authoring.history.created.component.title',
    defaultMessage: '{user} created this component',
    description: 'Title for the created group in the history log section for components.',
  },
  historyEditComponentEntry: {
    id: 'course-authoring.library-authoring.history.edit-entry',
    defaultMessage: '{user} edited this component',
    description: 'Edit entry of the history log in a component',
  },
  historyRenameComponentEntry: {
    id: 'course-authoring.library-authoring.history.rename-entry',
    defaultMessage: '{user} renamed this component',
    description: 'Rename entry of the history log in a component',
  },
  historyEntryDefaultUser: {
    id: 'course-authoring.library-authoring.history.default-user',
    defaultMessage: 'Author',
    description: 'Default user name when the user is not available',
  },
  
});

export default messages;
