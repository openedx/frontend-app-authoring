import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.delete-modal.title',
    defaultMessage: 'Delete this section?',
  },
  description: {
    id: 'course-authoring.course-outline.delete-modal.description',
    defaultMessage: 'Deleting this section is permanent and cannot be undone.',
  },
  deleteButton: {
    id: 'course-authoring.course-outline.delete-modal.button.delete',
    defaultMessage: 'Yes, delete this section',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.delete-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
});

export default messages;
