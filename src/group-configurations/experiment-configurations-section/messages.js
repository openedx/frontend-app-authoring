import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.group-configurations.experiment-configuration.title',
    defaultMessage: 'Experiment group configurations',
  },
  addNewGroup: {
    id: 'course-authoring.group-configurations.experiment-group.add-new-group',
    defaultMessage: 'New group configuration',
  },
  experimentConfigurationName: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name',
    defaultMessage: 'Group configuration name',
  },
  experimentConfigurationId: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.id',
    defaultMessage: 'Group configuration ID {id}',
  },
  experimentConfigurationNameFeedback: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name.feedback',
    defaultMessage: 'Name or short description of the configuration.',
  },
  experimentConfigurationNamePlaceholder: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name.placeholder',
    defaultMessage: 'This is the name of the group configuration',
  },
  experimentConfigurationNameRequired: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name.required',
    defaultMessage: 'Group configuration name is required.',
  },
  experimentConfigurationDescription: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.description',
    defaultMessage: 'Description',
  },
  experimentConfigurationDescriptionFeedback: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.description.feedback',
    defaultMessage: 'Optional long description.',
  },
  experimentConfigurationDescriptionPlaceholder: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.description.placeholder',
    defaultMessage: 'This is the description of the group configuration',
  },
  experimentConfigurationGroups: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups',
    defaultMessage: 'Groups',
  },
  experimentConfigurationGroupsFeedback: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.feedback',
    defaultMessage: 'Name of the groups that students will be assigned to, for example, Control, Video, Problems. You must have two or more groups.',
  },
  experimentConfigurationGroupsNameRequired: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.name.required',
    defaultMessage: 'All groups must have a name.',
  },
  experimentConfigurationGroupsNameUnique: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.name.unique',
    defaultMessage: 'All groups must have a unique name.',
  },
  experimentConfigurationGroupsRequired: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.required',
    defaultMessage: 'There must be at least one group.',
  },
  experimentConfigurationGroupsTooltip: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.tooltip',
    defaultMessage: 'Delete',
  },
  experimentConfigurationGroupsAdd: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.add',
    defaultMessage: 'Add another group',
  },
  experimentConfigurationDeleteRestriction: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.delete.restriction',
    defaultMessage: 'Cannot delete when in use by an experiment',
  },
  experimentConfigurationCancel: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.cancel',
    defaultMessage: 'Cancel',
  },
  experimentConfigurationSave: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.save',
    defaultMessage: 'Save',
  },
  experimentConfigurationCreate: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.create',
    defaultMessage: 'Create',
  },
  experimentConfigurationAlert: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.alert',
    defaultMessage: 'This configuration is currently used in content experiments. If you make changes to the groups, you may need to edit those experiments.',
  },
  emptyExperimentGroup: {
    id: 'course-authoring.group-configurations.experiment-card.empty-experiment-group',
    defaultMessage:
      'This group configuration is not in use. Start by adding a content experiment to any Unit via the {outlineComponentLink}.',
  },
  courseOutline: {
    id: 'course-authoring.group-configurations.experiment-card.course-outline',
    defaultMessage: 'Course outline',
  },
  actionEdit: {
    id: 'course-authoring.group-configurations.experiment-card.action.edit',
    defaultMessage: 'Edit',
  },
  actionDelete: {
    id: 'course-authoring.group-configurations.experiment-card.action.delete',
    defaultMessage: 'Delete',
  },
  subtitleModalDelete: {
    id: 'course-authoring.group-configurations.experiment-card.delete-modal.subtitle',
    defaultMessage: 'group configurations',
  },
  deleteRestriction: {
    id: 'course-authoring.group-configurations.experiment-card.delete-restriction',
    defaultMessage: 'Cannot delete when in use by a unit',
  },
});

export default messages;
