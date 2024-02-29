import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  addNewGroup: {
    id: 'course-authoring.group-configurations.content-groups.add-new-group',
    defaultMessage: 'New content group',
  },
  newGroupHeader: {
    id: 'course-authoring.group-configurations.content-groups.new-group.header',
    defaultMessage: 'Content group name *',
  },
  newGroupInputPlaceholder: {
    id: 'course-authoring.group-configurations.content-groups.new-group.input.placeholder',
    defaultMessage: 'This is the name of the group',
  },
  invalidMessage: {
    id: 'course-authoring.group-configurations.content-groups.new-group.invalid-message',
    defaultMessage: 'All groups must have a unique name.',
  },
  cancelButton: {
    id: 'course-authoring.group-configurations.content-groups.new-group.cancel',
    defaultMessage: 'Cancel',
  },
  deleteButton: {
    id: 'course-authoring.group-configurations.content-groups.edit-group.delete',
    defaultMessage: 'Delete',
  },
  createButton: {
    id: 'course-authoring.group-configurations.content-groups.new-group.create',
    defaultMessage: 'Create',
  },
  saveButton: {
    id: 'course-authoring.group-configurations.content-groups.edit-group.save',
    defaultMessage: 'Save',
  },
  requiredError: {
    id: 'course-authoring.group-configurations.content-groups.new-group.required-error',
    defaultMessage: 'Group name is required',
  },
  alertGroupInUsage: {
    id: 'course-authoring.group-configurations.content-groups.edit-group.alert-group-in-usage',
    defaultMessage: 'This content group is used in one or more units.',
  },
  deleteRestriction: {
    id: 'course-authoring.group-configurations.content-groups.delete-restriction',
    defaultMessage: 'Cannot delete when in use by a unit',
  },
  emptyContentGroups: {
    id: 'course-authoring.group-configurations.container.empty-content-groups',
    defaultMessage:
      'In the {outlineComponentLink}, use this group to control access to a component.',
  },
  courseOutline: {
    id: 'course-authoring.group-configurations.container.course-outline',
    defaultMessage: 'Course outline',
  },
  actionEdit: {
    id: 'course-authoring.group-configurations.container.action.edit',
    defaultMessage: 'Edit',
  },
  actionDelete: {
    id: 'course-authoring.group-configurations.container.action.delete',
    defaultMessage: 'Delete',
  },
  subtitleModalDelete: {
    id: 'course-authoring.group-configurations.container.delete-modal.subtitle',
    defaultMessage: 'content group',
  },
});

export default messages;
