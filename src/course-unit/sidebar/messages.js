import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  sidebarTitleDraftNeverPublished: {
    id: 'course-authoring.course-unit.sidebar.title.draft.never-published',
    defaultMessage: 'Draft (never published)',
  },
  sidebarTitleVisibleToStaffOnly: {
    id: 'course-authoring.course-unit.sidebar.title.visible.to-staff-only',
    defaultMessage: 'Visible to staff only',
  },
  sidebarTitlePublishedAndLive: {
    id: 'course-authoring.course-unit.sidebar.title.published.live',
    defaultMessage: 'Published and live',
  },
  sidebarTitleDraftUnpublishedChanges: {
    id: 'course-authoring.course-unit.sidebar.title.draft.unpublished',
    defaultMessage: 'Draft (unpublished changes)',
  },
  sidebarTitlePublishedNotYetReleased: {
    id: 'course-authoring.course-unit.sidebar.title.published.not-yet-released',
    defaultMessage: 'Published (not yet released)',
  },
  sidebarHeaderUnitLocationTitle: {
    id: 'course-authoring.course-unit.sidebar.header.unit-location.title',
    defaultMessage: 'Unit location',
  },
  sidebarBodyNote: {
    id: 'course-authoring.course-unit.sidebar.body.note',
    defaultMessage: 'Note: Do not hide graded assignments after they have been released.',
  },
  publishInfoPreviouslyPublished: {
    id: 'course-authoring.course-unit.publish.info.previously-published',
    defaultMessage: 'Previously published',
  },
  publishInfoDraftSaved: {
    id: 'course-authoring.course-unit.publish.info.draft.saved',
    defaultMessage: 'Draft saved on {editedOn} by {editedBy}',
  },
  publishLastPublished: {
    id: 'course-authoring.course-unit.publish.info.last.published',
    defaultMessage: 'Last published {publishedOn} by {publishedBy}',
  },
  releaseInfoUnscheduled: {
    id: 'course-authoring.course-unit.release.info.unscheduled',
    defaultMessage: 'Unscheduled',
  },
  releaseInfoWithSection: {
    id: 'course-authoring.course-unit.release.info.with-unit',
    defaultMessage: 'with {sectionName}',
  },
  visibilityIsVisibleToTitle: {
    id: 'course-authoring.course-unit.visibility.is-visible-to.title',
    defaultMessage: 'IS VISIBLE TO',
  },
  visibilityWillBeVisibleToTitle: {
    id: 'course-authoring.course-unit.visibility.will-be-visible-to.title',
    defaultMessage: 'WILL BE VISIBLE TO',
  },
  unitLocationTitle: {
    id: 'course-authoring.course-unit.unit-location.title',
    defaultMessage: 'LOCATION ID',
  },
  unitLocationDescription: {
    id: 'course-authoring.course-unit.unit-location.description',
    defaultMessage: 'To create a link to this unit from an HTML component in this course, enter /jump_to_id/{id} as the URL value',
  },
  visibilityCheckboxTitle: {
    id: 'course-authoring.course-unit.visibility.checkbox.title',
    defaultMessage: 'Hide from learners',
  },
  visibilityStaffOnlyTitle: {
    id: 'course-authoring.course-unit.visibility.staff-only.title',
    defaultMessage: 'Staff only',
  },
  visibilityStaffAndLearnersTitle: {
    id: 'course-authoring.course-unit.visibility.staff-and-learners.title',
    defaultMessage: 'Staff and learners',
  },
  visibilityHasExplicitStaffLockText: {
    id: 'course-authoring.course-unit.visibility.has-explicit-staff-lock.text',
    defaultMessage: 'with {date} {sectionName}',
  },
  actionButtonPublishTitle: {
    id: 'course-authoring.course-unit.action-buttons.publish.title',
    defaultMessage: 'Publish',
  },
  actionButtonDiscardChangesTitle: {
    id: 'course-authoring.course-unit.action-button.discard-changes.title',
    defaultMessage: 'Discard changes',
  },
  actionButtonCopyUnitTitle: {
    id: 'course-authoring.course-unit.action-button.copy-unit.title',
    defaultMessage: 'Copy unit',
  },
  releaseStatusTitle: {
    id: 'course-authoring.course-unit.status.release.title',
    defaultMessage: 'RELEASE',
  },
  releasedStatusTitle: {
    id: 'course-authoring.course-unit.status.released.title',
    defaultMessage: 'RELEASED',
  },
  scheduledStatusTitle: {
    id: 'course-authoring.course-unit.status.scheduled.title',
    defaultMessage: 'SCHEDULED',
  },
});

export default messages;
