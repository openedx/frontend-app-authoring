import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  altButtonEdit: {
    id: 'course-authoring.course-unit.heading.button.edit.alt',
    defaultMessage: 'Edit',
    description: 'The unit edit button text',
  },
  ariaLabelButtonEdit: {
    id: 'course-authoring.course-unit.heading.button.edit.aria-label',
    defaultMessage: 'Edit field',
    description: 'The unit edit button aria label',
  },
  altButtonSettings: {
    id: 'course-authoring.course-unit.heading.button.settings.alt',
    defaultMessage: 'Settings',
    description: 'The unit settings button text',
  },
  definedVisibilityMessage: {
    id: 'course-authoring.course-unit.heading.visibility.defined.message',
    defaultMessage: 'Access to this unit is restricted to: {selectedGroupsLabel}',
    description: 'Group visibility accessibility text for Unit',
  },
  statusBarLiveBadge: {
    id: 'course-authoring.course-unit.status-bar.visibility.chip',
    defaultMessage: 'Live',
    description: 'Text for the Live Badge in the status bar.',
  },
  statusBarStaffOnly: {
    id: 'course-authoring.course-unit.status-bar.visibility.staff-only',
    defaultMessage: 'Staff Only',
    description: 'Text for the Staff Only Badge in the status bar.',
  },
  statusBarScheduledBadge: {
    id: 'course-authoring.course-unit.status-bar.visibility.scheduled',
    defaultMessage: 'Scheduled',
    description: 'Text for the Upcoming Badge in the status bar.',
  },
  statusBarDraftChangesBadge: {
    id: 'course-authoring.course-unit.status-bar.publish-status.draft-changes',
    defaultMessage: 'Unpublished changes',
    description: 'Text for the Draft Changes Badge in the status bar.',
  },
  statusBarDiscussionsEnabled: {
    id: 'course-authoring.course-unit.status-bar.discussions-enabled',
    defaultMessage: 'Discussions Enabled',
    description: 'Text for the Discussions enabled Badge in the status bar.',
  },
  statusBarDraftNeverPublished: {
    id: 'course-authoring.course-unit.status-bar.visibility.draft',
    defaultMessage: 'Draft (Never Published)',
    description: 'Text for the Discussions enabled Badge in the status bar.',
  },
  statusBarGroupAccessOneGroup: {
    id: 'course-authoring.course-unit.status-bar.access.one-group',
    defaultMessage: 'Access: {groupName}',
    description: 'Text in the status bar when the access for the unit is for one group',
  },
  statusBarGroupAccessMultipleGroup: {
    id: 'course-authoring.course-unit.status-bar.access.multiple-group',
    defaultMessage: 'Access: {groupsCount} groups',
    description: 'Text in the status bar when the access for the unit is for one group',
  },
});

export default messages;
