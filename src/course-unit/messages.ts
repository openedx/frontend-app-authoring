import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  alertFailedGeneric: {
    id: 'course-authoring.course-unit.general.alert.error.description',
    defaultMessage: 'Unable to {actionName} {type}. Please try again.',
  },
  alertUnpublishedVersion: {
    id: 'course-authoring.course-unit.general.alert.unpublished-version.description',
    defaultMessage: 'Note: The last published version of this unit is live. By publishing changes you will change the student experience.',
  },
  pasteButtonText: {
    id: 'course-authoring.course-unit.paste-component.btn.text',
    defaultMessage: 'Paste component',
  },
  alertMoveSuccessTitle: {
    id: 'course-authoring.course-unit.alert.xblock.move.success.title',
    defaultMessage: 'Success!',
    description: 'Title for the success alert when an XBlock is moved successfully',
  },
  alertMoveSuccessDescription: {
    id: 'course-authoring.course-unit.alert.xblock.move.success.description',
    defaultMessage: '{title} has been moved',
    description: 'Description for the success alert when an XBlock is moved successfully',
  },
  alertMoveCancelTitle: {
    id: 'course-authoring.course-unit.alert.xblock.move.cancel.title',
    defaultMessage: 'Move cancelled',
    description: 'Title for the alert when moving an XBlock is cancelled',
  },
  alertMoveCancelDescription: {
    id: 'course-authoring.course-unit.alert.xblock.move.cancel.description',
    defaultMessage: '{title} has been moved back to its original location',
    description: 'Description for the alert when moving an XBlock is cancelled and the XBlock is moved back to its original location',
  },
  undoMoveButton: {
    id: 'course-authoring.course-unit.alert.xblock.move.undo.btn.text',
    defaultMessage: 'Undo move',
    description: 'Text for the button allowing users to undo a move action of an XBlock',
  },
  newLocationButton: {
    id: 'course-authoring.course-unit.alert.xblock.new.location.btn.text',
    defaultMessage: 'Take me to the new location',
    description: 'Text for the button allowing users to navigate to the new location after an XBlock has been moved',
  },
  alertLibraryUnitReadOnlyText: {
    id: 'course-authoring.course-unit.alert.read-only.text',
    defaultMessage: 'This unit can only be edited from the {link}.',
    description: 'Text of the alert when the unit is read only because is a library unit',
  },
  alertLibraryUnitReadOnlyLinkText: {
    id: 'course-authoring.course-unit.alert.read-only.link.text',
    defaultMessage: 'library',
    description: 'Text of the link in the alert when the unit is read only because is a library unit',
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
    defaultMessage: 'Access: {groupsCount} Groups',
    description: 'Text in the status bar when the access for the unit is for one group',
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
});

export default messages;
