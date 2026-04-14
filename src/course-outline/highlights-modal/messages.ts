import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.highlights-modal.title',
    defaultMessage: 'Highlights for {title}',
  },
  description: {
    id: 'course-authoring.course-outline.highlights-modal.description',
    defaultMessage: 'Enter 3-5 highlights to include in the email message that learners receive for this section (250 character limit). For more information and an example of the email template, read our {documentation}.',
  },
  documentationLink: {
    id: 'course-authoring.course-outline.highlights-modal.documentation-link',
    defaultMessage: 'documentation',
  },
  highlight: {
    id: 'course-authoring.course-outline.highlights-modal.highlight',
    defaultMessage: 'Highlight {index}',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.highlights-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  saveButton: {
    id: 'course-authoring.course-outline.highlights-modal.button.save',
    defaultMessage: 'Save',
  },
  highlightsTitle: {
    id: 'course.authoring.highlights.card.title',
    defaultMessage: 'Highlights',
    description: 'Title of the highlights card',
  },
  editButton: {
    id: 'course.authoring.highlights.card.edit.button',
    defaultMessage: 'Edit',
    description: 'Edit button text in viewing mode',
  },
  addHighlightsButton: {
    id: 'course.authoring.highlights.empty.add.button',
    defaultMessage: 'Add Highlights',
    description: 'Add highlights button in empty state',
  },
  showMoreButton: {
    id: 'course.authoring.highlights.card.show.more.button',
    defaultMessage: 'Show More',
    description: 'Show more button to expand highlights list',
  },
  noHighlightsMessage: {
    id: 'course.authoring.highlights.empty.message',
    defaultMessage: 'No highlights added yet. Add highlights to help learners focus on key points.',
    description: 'Message shown when no highlights exist',
  },
  unsavedChangesTitle: {
    id: 'course.authoring.highlights.unsaved.changes.title',
    defaultMessage: 'Leaving without saving?',
    description: 'Title of unsaved changes confirmation dialog',
  },
  unsavedChangesMessage: {
    id: 'course.authoring.highlights.unsaved.changes.message',
    defaultMessage: 'Changes you made to highlights will not be saved',
    description: 'Message in unsaved changes confirmation dialog',
  },
  keepEditingButton: {
    id: 'course.authoring.highlights.unsaved.changes.keep.editing.button',
    defaultMessage: 'Cancel',
    description: 'Button to keep editing and close confirmation dialog',
  },
  discardChangesButton: {
    id: 'course.authoring.highlights.unsaved.changes.discard.button',
    defaultMessage: 'Leave',
    description: 'Button to discard changes and navigate away',
  },
});

export default messages;
