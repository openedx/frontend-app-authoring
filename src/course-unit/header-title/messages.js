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
  commonVisibilityMessage: {
    id: 'course-authoring.course-unit.heading.visibility.common.message',
    defaultMessage: 'Access to some content in this unit is restricted to specific groups of learners.',
    description: 'The label text of some content restriction in this unit',
  },
  statusBarLiveBadge: {
    id: 'course-authoring.course-unit.status-bar.visibility.chip',
    defaultMessage: 'Live',
    description: 'Text for the Live Badge in the status bar.',
  },
  statusBarReadyBadge: {
    id: 'course-authoring.course-unit.status-bar.visibility.ready',
    defaultMessage: 'Ready',
    description: 'Text for the Ready Badge in the status bar.',
  },
  statusBarStaffOnly: {
    id: 'course-authoring.course-unit.status-bar.visibility.staff-only',
    defaultMessage: 'Visible to Staff-Only',
    description: 'Text for the Staff Only Badge in the status bar.',
  },
  statusBarUpcomingBadge: {
    id: 'course-authoring.course-unit.status-bar.visibility.Upcoming',
    defaultMessage: 'Upcoming',
    description: 'Text for the Upcoming Badge in the status bar.',
  },
  statusBarUnpublishedBadge: {
    id: 'course-authoring.course-unit.status-bar.publish-status.unpublished',
    defaultMessage: 'Unpublished',
    description: 'Text for the Unpublished Badge in the status bar.',
  },
  statusBarDraftChangesBadge: {
    id: 'course-authoring.course-unit.status-bar.publish-status.draft-changes',
    defaultMessage: 'Draft Changes',
    description: 'Text for the Draft Changes Badge in the status bar.',
  },
  statusBarPublishedBadge: {
    id: 'course-authoring.course-unit.status-bar.publish-status.published',
    defaultMessage: 'Published',
    description: 'Text for the Published Badge in the status bar.',
  },
  statusBarDiscussionsEnabled: {
    id: 'course-authoring.course-unit.status-bar.discussions-enabled',
    defaultMessage: 'Discussions Enabled',
    description: 'Text for the Discussions enabled Badge in the status bar.',
  },
});

export default messages;
