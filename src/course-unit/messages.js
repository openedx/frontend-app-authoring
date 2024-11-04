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
});

export default messages;
