import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  editNameButtonAlt: {
    id: 'course-authoring.library-authoring.sidebar.info.edit-name.alt',
    defaultMessage: 'Edit library name',
    description: 'Alt text for edit library name icon button',
  },
  organizationSectionTitle: {
    id: 'course-authoring.library-authoring.sidebar.info.organization.title',
    defaultMessage: 'Organization',
    description: 'Title for Organization section in Library info sidebar.',
  },
  libraryHistorySectionTitle: {
    id: 'course-authoring.library-authoring.sidebar.info.history.title',
    defaultMessage: 'Library History',
    description: 'Title for Library History section in Library info sidebar.',
  },
  lastModifiedLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.history.last-modified',
    defaultMessage: 'Last Modified',
    description: 'Last Modified label used in Library History section.',
  },
  createdLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.history.created',
    defaultMessage: 'Created',
    description: 'Created label used in Library History section.',
  },
  draftStatusLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.draft',
    defaultMessage: 'Draft',
    description: 'Label in library info sidebar when the library is on draft status',
  },
  neverPublishedLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.never',
    defaultMessage: '(Never Published)',
    description: 'Label in library info sidebar when the library is never published',
  },
  unpublishedStatusLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.unpublished',
    defaultMessage: '(Unpublished Changes)',
    description: 'Label in library info sidebar when the library has unpublished changes',
  },
  publishedStatusLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.published',
    defaultMessage: 'Published',
    description: 'Label in library info sidebar when the library is on published status',
  },
  publishButtonLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.publish-button',
    defaultMessage: 'Publish',
    description: 'Label of publish button for a library.',
  },
  discardChangesButtonLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.discard-button',
    defaultMessage: 'Discard Changes',
    description: 'Label of discard changes button for a library.',
  },
  lastPublishedMsg: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.last-published',
    defaultMessage: 'Last published on {date} at {time} UTC by {user}.',
    description: 'Body meesage of the library info sidebar when library is published.',
  },
  lastPublishedMsgWithoutUser: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.last-published-no-user',
    defaultMessage: 'Last published on {date} at {time} UTC.',
    description: 'Body meesage of the library info sidebar when library is published.',
  },
  lastDraftMsg: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.last-draft',
    defaultMessage: 'Draft saved on {date} at {time} UTC by {user}.',
    description: 'Body meesage of the library info sidebar when library is on draft status.',
  },
  lastDraftMsgWithoutUser: {
    id: 'course-authoring.library-authoring.sidebar.info.publish-status.last-draft-no-user',
    defaultMessage: 'Draft saved on {date} at {time} UTC.',
    description: 'Body meesage of the library info sidebar when library is on draft status.',
  },
  publishSuccessMsg: {
    id: 'course-authoring.library-authoring.publish.success',
    defaultMessage: 'Library published successfully',
    description: 'Message when the library is published successfully.',
  },
  publishErrorMsg: {
    id: 'course-authoring.library-authoring.publish.error',
    defaultMessage: 'There was an error publishing the library.',
    description: 'Message when there is an error when publishing the library.',
  },
  revertSuccessMsg: {
    id: 'course-authoring.library-authoring.revert.success',
    defaultMessage: 'Library changes reverted successfully',
    description: 'Message when the library changes are reverted successfully.',
  },
  revertErrorMsg: {
    id: 'course-authoring.library-authoring.publish.error',
    defaultMessage: 'There was an error reverting changes in the library.',
    description: 'Message when there is an error when reverting changes in the library.',
  },
  updateLibrarySuccessMsg: {
    id: 'course-authoring.library-authoring.library.update.success',
    defaultMessage: 'Library updated successfully',
    description: 'Message when the library is updated successfully',
  },
  updateLibraryErrorMsg: {
    id: 'course-authoring.library-authoring.library.update.error',
    defaultMessage: 'There was an error updating the library',
    description: 'Message when there is an error when updating the library',
  },
});

export default messages;
