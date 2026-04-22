import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  tagListColumnValueHeader: {
    id: 'course-authoring.tag-list.column.value.header',
    defaultMessage: 'Tag name',
  },
  tagListColumnCountHeader: {
    id: 'course-authoring.tag-list.column.count.header',
    defaultMessage: 'Usage Count',
  },
  tagListError: {
    id: 'course-authoring.tag-list.error',
    defaultMessage: 'Error: unable to load child tags',
  },
  tagCreationSuccessMessage: {
    id: 'course-authoring.tag-list.creation-success',
    defaultMessage: 'Tag "{name}" created successfully',
  },
  tagCreationErrorMessage: {
    id: 'course-authoring.tag-list.creation-error',
    defaultMessage: 'Error creating tag: {errorMessage}',
  },
  tagUpdateSuccessMessage: {
    id: 'course-authoring.tag-list.update-success',
    defaultMessage: 'Tag "{name}" updated successfully',
  },
  addSubtag: {
    id: 'course-authoring.tag-list.add-subtag',
    defaultMessage: 'Add Subtag',
  },
  nameRequired: {
    id: 'course-authoring.tag-list.validation.name-required',
    defaultMessage: 'Name is required',
  },
  invalidCharacterInTagName: {
    id: 'course-authoring.tag-list.validation.invalid-character',
    defaultMessage: 'Invalid character in tag name',
  },
  createNewTagTooltip: {
    id: 'course-authoring.tag-list.create-new-tag.tooltip',
    defaultMessage: 'Create a new tag',
  },
  createTagButtonLabel: {
    id: 'course-authoring.tag-list.create-tag.button-label',
    defaultMessage: 'Create Tag',
  },
  moreActionsForTag: {
    id: 'course-authoring.tag-list.more-actions-for-tag',
    defaultMessage: 'More actions for tag "{tagName}"',
  },
  showSubtagsButtonLabel: {
    id: 'course-authoring.tag-list.show-subtags.button-label',
    defaultMessage: 'Show Subtags',
  },
  hideSubtagsButtonLabel: {
    id: 'course-authoring.tag-list.hide-subtags.button-label',
    defaultMessage: 'Hide Subtags',
  },
  tagUpdateErrorMessage: {
    id: 'course-authoring.tag-list.update-error',
    defaultMessage: 'Error updating tag: {errorMessage}',
  },
  renameTag: {
    id: 'course-authoring.tag-list.rename-tag',
    defaultMessage: 'Rename',
  },
  deleteTag: {
    id: 'course-authoring.tag-list.delete-tag',
    defaultMessage: 'Delete',
  },
  deleteTagDisabledTooltip: {
    id: 'course-authoring.tag-list.delete-tag-disabled-tooltip',
    defaultMessage: 'This tag does not allow deletion',
  },
  tagEditForbidden: {
    id: 'course-authoring.tag-list.system-defined-tag-edit-disabled',
    defaultMessage: 'Disabled because this is not allowed to be changed',
  },
  tagDeleteForbidden: {
    id: 'course-authoring.tag-list.system-defined-tag-delete-disabled',
    defaultMessage: 'Disabled because this is not allowed to be deleted',
  },
  hasOpenDraft: {
    id: 'course-authoring.tag-list.has-open-draft',
    defaultMessage: 'Disabled because tag creation or edit is in progress',
  },
  tagsDeleteSuccessMessage: {
    id: 'course-authoring.tag-list.delete-success',
    defaultMessage: '{count} tag(s) deleted. This change will be applied across all tagged content.',
  },
  tagDeleteErrorMessage: {
    id: 'course-authoring.tag-list.delete-error',
    defaultMessage: 'Error deleting tag: {errorMessage}',
  },
  confirmDeleteTitle: {
    id: 'course-authoring.tag-list.confirm-delete-title',
    defaultMessage: 'Delete "{tagName}"',
  },
  typeToConfirmDeleteOneTag: {
    id: 'course-authoring.tag-list.delete-one-tag-type-to-confirm',
    defaultMessage: 'DELETE',
  },
  deleteTagConfirmation: {
    id: 'course-authoring.tag-list.delete-tag-confirmation',
    defaultMessage: 'Warning! You are about to delete {count} tag(s).',
  },
  deleteLabelPlural: {
    id: 'course-authoring.tag-list.delete-label',
    defaultMessage: 'Delete Tags',
  },
  deleteLabelSingular: {
    id: 'course-authoring.tag-list.delete-label-singular',
    defaultMessage: 'Delete Tag',
  },
  cancelLabel: {
    id: 'course-authoring.tag-list.cancel-label',
    defaultMessage: 'Cancel',
  },
  typeToConfirmDeleteTagWithSubtags: {
    id: 'course-authoring.tag-list.delete-tag-with-subtags-type-to-confirm',
    defaultMessage: 'DELETE ALL {count} TAGS',
  },
  deleteTagWithSubtagsConfirmation: {
    id: 'course-authoring.tag-list.delete-tag-with-subtags-confirmation',
    defaultMessage: 'Warning! You are about to delete a tag containing sub-tags. If you proceed, {count} tags will be deleted.',
  },
  deleteTagConfirmationEmphasizedPart: {
    id: 'course-authoring.tag-list.delete-tag-confirmation-bold-part',
    defaultMessage: 'Any tags applied to course content will be removed across all assigned organizations.',
  },
});

export default messages;
