import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  draftTitle: {
    id: 'course-authoring.library-authoring.history.draft.title',
    defaultMessage: '{displayName} is a draft',
    description: 'Title for the draft group in the history log section.',
  },
  publishTitle: {
    id: 'course-authoring.library-authoring.history.publish.title',
    defaultMessage: '{user} published {icon} {displayName}',
    description: 'Title for the publish group in the history log section.',
  },
  publishTitleMultiple: {
    id: 'course-authoring.library-authoring.history.publish.title-multiple',
    defaultMessage: '{user} published {icon} Multiple Items',
    description: 'Title for the publish group in the history log section of multiple items.',
  },
  draftTitleDate: {
    id: 'course-authoring.library-authoring.history.draft.date',
    defaultMessage: '{count, plural, one {{count} change} other {{count} changes}} since {date}',
    description: 'Title for the draft group in the history log section.',
  },
  createdTitle: {
    id: 'course-authoring.library-authoring.history.created.title',
    defaultMessage: '{user} created {icon} {displayName}',
    description: 'Title for the created group in the history log section.',
  },
  historyEditEntry: {
    id: 'course-authoring.library-authoring.history.edit-entry',
    defaultMessage: '{user} edited {icon} {displayName}',
    description: 'Edit entry of the history log.',
  },
  historyRenameEntry: {
    id: 'course-authoring.library-authoring.history.rename-entry',
    defaultMessage: '{user} renamed {icon} {displayName}',
    description: 'Rename entry of the history log.',
  },
  historyCreatedEntry: {
    id: 'course-authoring.library-authoring.history.created-entry',
    defaultMessage: '{user} created {icon} {displayName}',
    description: 'Created entry of the history log.',
  },
  historyDeletedEntry: {
    id: 'course-authoring.library-authoring.history.deleted-entry',
    defaultMessage: '{user} deleted {icon} {displayName}',
    description: 'Deleted entry of the history log.',
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
  previewChangesTitle: {
    id: 'course-authoring.library-authoring.history.preview-changes.title',
    defaultMessage: 'Preview changes: {title}',
    description: 'Title for the modal that previews changes for a history entry.',
  },
  moreActions: {
    id: 'course-authoring.library-authoring.history.more-actions',
    defaultMessage: 'More actions',
    description: 'Dropdown label for history log actions.',
  },
  showThisVersion: {
    id: 'course-authoring.library-authoring.history.show-this-version',
    defaultMessage: 'Show this version',
    description: 'Action to open the version comparison modal for a history entry.',
  },
});

export default messages;
