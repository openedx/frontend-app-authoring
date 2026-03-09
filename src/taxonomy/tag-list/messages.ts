import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  tagListColumnValueHeader: {
    id: 'course-authoring.tag-list.column.value.header',
    defaultMessage: 'Tag name',
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
    defaultMessage: 'Error: unable to create tag',
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
});

export default messages;
