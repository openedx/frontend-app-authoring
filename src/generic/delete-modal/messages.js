import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.delete-modal.title',
    defaultMessage: 'Delete this {category}?',
  },
  description: {
    id: 'course-authoring.course-outline.delete-modal.description',
    defaultMessage: 'Deleting this {category} is permanent and cannot be undone.',
  },
  deleteButton: {
    id: 'course-authoring.course-outline.delete-modal.button.delete',
    defaultMessage: 'Delete',
  },
  pendingDeleteButton: {
    id: 'course-authoring.course-outline.delete-modal.button.pending-delete',
    defaultMessage: 'Deleting',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.delete-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
});

export default messages;
