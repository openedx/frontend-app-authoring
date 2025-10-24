import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  unsavedModalTitle: {
    id: 'course-authoring.release-notes.unsaved-modal.title',
    defaultMessage: 'Unsaved changes',
  },
  unsavedModalDescription: {
    id: 'course-authoring.release-notes.unsaved-modal.description',
    defaultMessage: 'Are you sure you want to leave the editor? All unsaved changes will be lost.',
  },
  keepEditingButton: {
    id: 'course-authoring.release-notes.unsaved-modal.keep-editing',
    defaultMessage: 'Keep editing',
  },
  leaveEditorButton: {
    id: 'course-authoring.release-notes.unsaved-modal.leave-editor',
    defaultMessage: 'Leave editor',
  },
});

export default messages;
