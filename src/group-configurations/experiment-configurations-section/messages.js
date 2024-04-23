import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.group-configurations.experiment-configuration.title',
    defaultMessage: 'Experiment group configurations',
    description: 'Title for the page displaying experiment group configurations.',
  },
  addNewGroup: {
    id: 'course-authoring.group-configurations.experiment-group.add-new-group',
    defaultMessage: 'New group configuration',
    description: 'Label for adding a new experiment group configuration.',
  },
  experimentConfigurationName: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name',
    defaultMessage: 'Group configuration name',
    description: 'Label for the input field to enter the name of an experiment group configuration.',
  },
  experimentConfigurationId: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.id',
    defaultMessage: 'Group configuration ID {id}',
    description: 'Label displaying the ID of an experiment group configuration.',
  },
  experimentConfigurationNameFeedback: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name.feedback',
    defaultMessage: 'Name or short description of the configuration.',
    description: 'Feedback message for the name/description input field of an experiment group configuration.',
  },
  experimentConfigurationNamePlaceholder: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name.placeholder',
    defaultMessage: 'This is the name of the group configuration',
    description: 'Placeholder text for the name input field of an experiment group configuration.',
  },
  experimentConfigurationNameRequired: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.name.required',
    defaultMessage: 'Group configuration name is required.',
    description: 'Error message displayed when the name of the experiment group configuration is required but not provided.',
  },
  experimentConfigurationDescription: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.description',
    defaultMessage: 'Description',
    description: 'Label for the description input field of an experiment group configuration.',
  },
  experimentConfigurationDescriptionFeedback: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.description.feedback',
    defaultMessage: 'Optional long description.',
    description: 'Feedback message for the description input field of an experiment group configuration.',
  },
  experimentConfigurationDescriptionPlaceholder: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.description.placeholder',
    defaultMessage: 'This is the description of the group configuration',
    description: 'Placeholder text for the description input field of an experiment group configuration.',
  },
  experimentConfigurationGroups: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups',
    defaultMessage: 'Groups',
    description: 'Label for the section displaying groups within an experiment group configuration.',
  },
  experimentConfigurationGroupsFeedback: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.feedback',
    defaultMessage: 'Name of the groups that students will be assigned to, for example, Control, Video, Problems. You must have two or more groups.',
    description: 'Feedback message for the groups section of an experiment group configuration.',
  },
  experimentConfigurationGroupsNameRequired: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.name.required',
    defaultMessage: 'All groups must have a name.',
    description: 'Error message displayed when the name of a group within an experiment group configuration is required but not provided.',
  },
  experimentConfigurationGroupsNameUnique: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.name.unique',
    defaultMessage: 'All groups must have a unique name.',
    description: 'Error message displayed when the names of groups within an experiment group configuration are not unique.',
  },
  experimentConfigurationGroupsRequired: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.required',
    defaultMessage: 'There must be at least one group.',
    description: 'Error message displayed when at least one group is required within an experiment group configuration.',
  },
  experimentConfigurationGroupsTooltip: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.tooltip',
    defaultMessage: 'Delete',
    description: 'Tooltip message for the delete action within the groups section of an experiment group configuration.',
  },
  experimentConfigurationGroupsAdd: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.groups.add',
    defaultMessage: 'Add another group',
    description: 'Label for the button to add another group within the groups section of an experiment group configuration.',
  },
  experimentConfigurationDeleteRestriction: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.delete.restriction',
    defaultMessage: 'Cannot delete when in use by an experiment',
    description: 'Error message indicating that an experiment group configuration cannot be deleted because it is currently in use by an experiment.',
  },
  experimentConfigurationCancel: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.cancel',
    defaultMessage: 'Cancel',
    description: 'Label for the cancel button within an experiment group configuration.',
  },
  experimentConfigurationSave: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.save',
    defaultMessage: 'Save',
    description: 'Label for the save button within an experiment group configuration.',
  },
  experimentConfigurationCreate: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.create',
    defaultMessage: 'Create',
    description: 'Label for the create button within an experiment group configuration.',
  },
  experimentConfigurationAlert: {
    id: 'course-authoring.group-configurations.experiment-configuration.container.alert',
    defaultMessage: 'This configuration is currently used in content experiments. If you make changes to the groups, you may need to edit those experiments.',
    description: 'Alert message indicating that an experiment group configuration is currently used in content experiments and that changes may require editing those experiments.',
  },
  emptyExperimentGroup: {
    id: 'course-authoring.group-configurations.experiment-card.empty-experiment-group',
    defaultMessage: 'This group configuration is not in use. Start by adding a content experiment to any Unit via the {outlineComponentLink}.',
    description: 'Message displayed when an experiment group configuration is not in use and suggests adding a content experiment.',
  },
  courseOutline: {
    id: 'course-authoring.group-configurations.experiment-card.course-outline',
    defaultMessage: 'Course outline',
    description: 'Label for the course outline section within an experiment card.',
  },
  actionEdit: {
    id: 'course-authoring.group-configurations.experiment-card.action.edit',
    defaultMessage: 'Edit',
    description: 'Label for the edit action within an experiment card.',
  },
  actionDelete: {
    id: 'course-authoring.group-configurations.experiment-card.action.delete',
    defaultMessage: 'Delete',
    description: 'Label for the delete action within an experiment card.',
  },
  subtitleModalDelete: {
    id: 'course-authoring.group-configurations.experiment-card.delete-modal.subtitle',
    defaultMessage: 'group configurations',
    description: 'Subtitle for the delete modal indicating the type of entity being deleted.',
  },
  deleteRestriction: {
    id: 'course-authoring.group-configurations.experiment-card.delete-restriction',
    defaultMessage: 'Cannot delete when in use by a unit',
    description: 'Error message indicating that an experiment card cannot be deleted because it is currently in use by a unit.',
  },
});

export default messages;
