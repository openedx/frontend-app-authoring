import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  emptyContentGroups: {
    id: 'course-authoring.group-configurations.container.empty-content-groups',
    defaultMessage:
      'In the {outlineComponentLink}, use this group to control access to a component.',
  },
  emptyExperimentGroup: {
    id: 'course-authoring.group-configurations.container.empty-experiment-group',
    defaultMessage:
      'This group configuration is not in use. Start by adding a content experiment to any Unit via the {outlineComponentLink}.',
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
  accessTo: {
    id: 'course-authoring.group-configurations.container.access-to',
    defaultMessage: 'This group controls access to:',
  },
  experimentAccessTo: {
    id: 'course-authoring.group-configurations.container.experiment-access-to',
    defaultMessage: 'This group configuration is used in:',
  },
  containsGroups: {
    id: 'course-authoring.group-configurations.container.contains-groups',
    defaultMessage: 'Contains {len} groups',
  },
  containsGroup: {
    id: 'course-authoring.group-configurations.container.contains-group',
    defaultMessage: 'Contains 1 group',
  },
  notInUse: {
    id: 'course-authoring.group-configurations.container.not-in-use',
    defaultMessage: 'Not in use',
  },
  usedInLocations: {
    id: 'course-authoring.group-configurations.container.used-in-locations',
    defaultMessage: 'Used in {len} locations',
  },
  usedInLocation: {
    id: 'course-authoring.group-configurations.container.used-in-location',
    defaultMessage: 'Used in 1 location',
  },
  titleId: {
    id: 'course-authoring.group-configurations.container.title-id',
    defaultMessage: 'ID: {id}',
  },
  subtitleModalDelete: {
    id: 'course-authoring.group-configurations.container.delete-modal.subtitle',
    defaultMessage: 'content group',
  },
  deleteRestriction: {
    id: 'course-authoring.group-configurations.container.delete-restriction',
    defaultMessage: 'Cannot delete when in use by a unit',
  },
});

export default messages;
