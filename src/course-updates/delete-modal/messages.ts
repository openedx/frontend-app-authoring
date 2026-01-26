import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  deleteModalTitle: {
    id: 'course-authoring.course-updates.delete-modal.title',
    defaultMessage: 'Are you sure you want to delete this update?',
  },
  deleteModalDescription: {
    id: 'course-authoring.course-updates.delete-modal.description',
    defaultMessage: 'This action cannot be undone.',
  },
  cancelButton: {
    id: 'course-authoring.course-updates.actions.cancel',
    defaultMessage: 'Cancel',
  },
  deleteButton: {
    id: 'course-authoring.course-updates.button.delete',
    defaultMessage: 'Delete',
  },
});

export default messages;
