import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  deleteDialogTitle: {
    id: 'course-authoring.taxonomy-list.dialog.delete.title',
    defaultMessage: 'Delete "{taxonomyName}"',
  },
  deleteDialogBody: {
    id: 'course-authoring.taxonomy-list.dialog.delete.body',
    defaultMessage: 'Warning! You are about to delete a taxonomy containing {tagsCount} tags. Assigned organizations will no longer be able to access the taxonomy, and any tags applied to course content will be removed.',
  },
  deleteDialogConfirmLabel: {
    id: 'course-authoring.taxonomy-list.dialog.delete.confirm.label',
    defaultMessage: 'Type {deleteLabel} to confirm',
  },
  deleteDialogConfirmDeleteLabel: {
    id: 'course-authoring.taxonomy-list.dialog.delete.confirmDelete.label',
    defaultMessage: 'DELETE',
  },
  deleteDialogCancelLabel: {
    id: 'course-authoring.taxonomy-list.dialog.delete.cancel.label',
    defaultMessage: 'Cancel',
  },
  deleteDialogDeleteLabel: {
    id: 'course-authoring.taxonomy-list.dialog.delete.delete.label',
    defaultMessage: 'Delete',
  },
});

export default messages;
