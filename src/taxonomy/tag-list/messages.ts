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
});

export default messages;
