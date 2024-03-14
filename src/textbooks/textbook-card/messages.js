import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  chaptersTitle: {
    id: 'course-authoring.textbooks.chapters.title',
    defaultMessage: '{count} PDF chapters',
  },
  buttonView: {
    id: 'course-authoring.textbooks.button.view',
    defaultMessage: 'View the PDF live',
  },
  buttonViewAlt: {
    id: 'course-authoring.textbooks.button.view.alt',
    defaultMessage: 'textbook-view-button',
  },
  buttonEdit: {
    id: 'course-authoring.textbooks.button.edit',
    defaultMessage: 'Edit',
  },
  buttonEditAlt: {
    id: 'course-authoring.textbooks.button.edit.alt',
    defaultMessage: 'textbook-edit-button',
  },
  buttonDelete: {
    id: 'course-authoring.textbooks.button.delete',
    defaultMessage: 'Delete',
  },
  buttonDeleteAlt: {
    id: 'course-authoring.textbooks.button.delete.alt',
    defaultMessage: 'textbook-delete-button',
  },
  deleteModalTitle: {
    id: 'course-authoring.textbooks.form.delete-modal.title',
    defaultMessage: 'Delete “{textbookTitle}”?',
  },
  deleteModalDescription: {
    id: 'course-authoring.textbooks.form.delete-modal.description',
    defaultMessage: 'Deleting a textbook cannot be undone and once deleted any reference to it in your courseware\'s navigation will also be removed.',
  },
});

export default messages;
