import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  draftTitle: {
    id: 'course-authoring.library-authoring.history.draft.title',
    defaultMessage: '{displayName} is a draft',
    description: 'Title for the draft group in the history log section.',
  },
  publishComponentTitle: {
    id: 'course-authoring.library-authoring.history.publish.component.title',
    defaultMessage: '{user} published this component',
    description: 'Title for the publish group in the history log section for components.',
  },
  draftTitleDate: {
    id: 'course-authoring.library-authoring.history.draft.date',
    defaultMessage: '{count, plural, one {{count} change} other {{count} changes}} since {date}',
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
  historyContributors: {
    id: 'course-authoring.library-authoring.history.contributors',
    defaultMessage: '{count} {count, plural, one {author} other {authors}} contributed',
    description: 'Contributors count in a publish history group',
  },
});

export default messages;
