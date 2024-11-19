import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'authoring.course-unit.preview-changes.modal-title',
    defaultMessage: 'Preview changes: {blockTitle}',
    description: 'Preview changes modal title text',
  },
  diffTitle: {
    id: 'authoring.course-unit.preview-changes.modal-diff-title',
    defaultMessage: 'Preview changes: {oldName} -> {newName}',
    description: 'Preview changes modal title text',
  },
  defaultUnitTitle: {
    id: 'authoring.course-unit.preview-changes.modal-default-unit-title',
    defaultMessage: 'Preview changes: Unit',
    description: 'Preview changes modal default title text for units',
  },
  defaultComponentTitle: {
    id: 'authoring.course-unit.preview-changes.modal-default-component-title',
    defaultMessage: 'Preview changes: Component',
    description: 'Preview changes modal default title text for components',
  },
  acceptChangesBtn: {
    id: 'authoring.course-unit.preview-changes.accept-changes-btn',
    defaultMessage: 'Accept changes',
    description: 'Preview changes modal accept button text.',
  },
  acceptChangesFailure: {
    id: 'authoring.course-unit.preview-changes.accept-changes-failure',
    defaultMessage: 'Failed to update component',
    description: 'Toast message to display when accepting changes call fails',
  },
  ignoreChangesBtn: {
    id: 'authoring.course-unit.preview-changes.accept-ignore-btn',
    defaultMessage: 'Ignore changes',
    description: 'Preview changes modal ignore button text.',
  },
  ignoreChangesFailure: {
    id: 'authoring.course-unit.preview-changes.ignore-changes-failure',
    defaultMessage: 'Failed to ignore changes',
    description: 'Toast message to display when ignore changes call fails',
  },
  cancelBtn: {
    id: 'authoring.course-unit.preview-changes.cancel-btn',
    defaultMessage: 'Cancel',
    description: 'Preview changes modal cancel button text.',
  },
  confirmationTitle: {
    id: 'authoring.course-unit.preview-changes.confirmation-dialog-title',
    defaultMessage: 'Ignore these changes?',
    description: 'Preview changes confirmation dialog title when user clicks on ignore changes.',
  },
  confirmationDescription: {
    id: 'authoring.course-unit.preview-changes.confirmation-dialog-description',
    defaultMessage: 'Would you like to permanently ignore this updated version? If so, you won\'t be able to update this until a newer version is published (in the library).',
    description: 'Preview changes confirmation dialog description text when user clicks on ignore changes.',
  },
  confirmationConfirmBtn: {
    id: 'authoring.course-unit.preview-changes.confirmation-dialog-confirm-btn',
    defaultMessage: 'Ignore',
    description: 'Preview changes confirmation dialog confirm button text when user clicks on ignore changes.',
  },
});

export default messages;
