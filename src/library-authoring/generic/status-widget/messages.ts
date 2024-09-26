import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  draftStatusLabel: {
    id: 'course-authoring.library-authoring.generic.status-widget.draft',
    defaultMessage: 'Draft',
    description: 'Label in library authoring sidebar when the entity is on draft status',
  },
  neverPublishedLabel: {
    id: 'course-authoring.library-authoring.generic.status-widget.never',
    defaultMessage: '(Never Published)',
    description: 'Label in library authoring sidebar when the entity is never published',
  },
  unpublishedStatusLabel: {
    id: 'course-authoring.library-authoring.generic.status-widget.unpublished',
    defaultMessage: '(Unpublished Changes)',
    description: 'Label in library authoring sidebar when the entity has unpublished changes',
  },
  publishedStatusLabel: {
    id: 'course-authoring.library-authoring.generic.status-widget.published',
    defaultMessage: 'Published',
    description: 'Label in library authoring sidebar when the entity is on published status',
  },
  lastPublishedMsg: {
    id: 'course-authoring.library-authoring.generic.status-widget.last-published',
    defaultMessage: 'Last published on {date} at {time} by {user}.',
    description: 'Body message of the library authoring sidebar when the entity is published.',
  },
  lastPublishedMsgWithoutUser: {
    id: 'course-authoring.library-authoring.generic.status-widget.last-published-no-user',
    defaultMessage: 'Last published on {date} at {time}.',
    description: 'Body message of the library authoring sidebar when the entity is published.',
  },
  lastDraftMsg: {
    id: 'course-authoring.library-authoring.generic.status-widget.last-draft',
    defaultMessage: 'Draft saved on {date} at {time} by {user}.',
    description: 'Body message of the library authoring sidebar when the entity is on draft status.',
  },
  lastDraftMsgWithoutUser: {
    id: 'course-authoring.library-authoring.generic.status-widget.last-draft-no-user',
    defaultMessage: 'Draft saved on {date} at {time}.',
    description: 'Body message of the library authoring sidebar when the entity is on draft status.',
  },
  publishButtonLabel: {
    id: 'course-authoring.library-authoring.generic.status-widget.publish-button',
    defaultMessage: 'Publish',
    description: 'Label of publish button for an entity.',
  },
  discardChangesButtonLabel: {
    id: 'course-authoring.library-authoring.generic.status-widget.discard-button',
    defaultMessage: 'Discard Changes',
    description: 'Label of discard changes button for an entity.',
  },
});

export default messages;
