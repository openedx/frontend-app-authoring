import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'authoring.pagesAndResources.teams.heading',
    defaultMessage: 'Configure teams',
  },
  enableTeamsLabel: {
    id: 'authoring.pagesAndResources.teams.enableTeams.label',
    defaultMessage: 'Teams',
  },
  enableTeamsHelp: {
    id: 'authoring.pagesAndResources.teams.enableTeams.help',
    defaultMessage: 'Allow learners to work together on specific projects or activities.',
  },
  enableTeamsLink: {
    id: 'authoring.pagesAndResources.teams.enableTeams.link',
    defaultMessage: 'Learn more about teams',
  },
  teamSize: {
    id: 'authoring.pagesAndResources.teams.teamSize.heading',
    defaultMessage: 'Team size',
  },
  maxTeamSize: {
    id: 'authoring.pagesAndResources.teams.teamSize.maxTeamSize',
    defaultMessage: 'Max team size',
  },
  maxTeamSizeHelp: {
    id: 'authoring.pagesAndResources.teams.teamSize.maxTeamSizeHelp',
    defaultMessage: 'The maximum number of learners that can join a team',
  },
  maxTeamSizeEmpty: {
    id: 'authoring.pagesAndResources.teams.teamSize.maxTeamSizeEmpty',
    defaultMessage: 'Enter max team size',
  },
  maxTeamSizeInvalid: {
    id: 'authoring.pagesAndResources.teams.teamSize.maxTeamSizeInvalid',
    defaultMessage: 'Max team size must be a positive number larger than zero.',
  },
  maxTeamSizeTooHigh: {
    id: 'authoring.pagesAndResources.teams.teamSize.maxTeamSizeTooHigh',
    defaultMessage: 'Max team size cannot be greater than {max}',
  },
  groups: {
    id: 'authoring.pagesAndResources.teams.groups.heading',
    defaultMessage: 'Groups',
  },
  groupsHelp: {
    id: 'authoring.pagesAndResources.teams.groups.help',
    defaultMessage: 'Groups are spaces where learners can create or join teams.',
  },
  configureGroup: {
    id: 'authoring.pagesAndResources.teams.configureGroup.heading',
    defaultMessage: 'Configure group',
  },
  groupFormNameLabel: {
    id: 'authoring.pagesAndResources.teams.group.name.label',
    defaultMessage: 'Name',
  },
  groupFormNameHelp: {
    id: 'authoring.pagesAndResources.teams.group.name.help',
    defaultMessage: 'Choose a unique name for this group',
  },
  groupFormNameEmpty: {
    id: 'authoring.pagesAndResources.teams.group.name.error.empty',
    defaultMessage: 'Enter a unique name for this group',
  },
  groupFormNameExists: {
    id: 'authoring.pagesAndResources.teams.group.name.error.exists',
    defaultMessage: 'It looks like this name is already in use',
  },
  groupFormDescriptionLabel: {
    id: 'authoring.pagesAndResources.teams.group.description.label',
    defaultMessage: 'Description',
  },
  groupFormDescriptionHelp: {
    id: 'authoring.pagesAndResources.teams.group.description.help',
    defaultMessage: 'Enter details about this group',
  },
  groupFormDescriptionError: {
    id: 'authoring.pagesAndResources.teams.group.description.error',
    defaultMessage: 'Enter a description for this group',
  },
  groupFormTypeLabel: {
    id: 'authoring.pagesAndResources.teams.group.type.label',
    defaultMessage: 'Type',
  },
  groupFormTypeHelp: {
    id: 'authoring.pagesAndResources.teams.group.type.help',
    defaultMessage: 'Control who can see, create and join teams',
  },
  groupTypeOpen: {
    id: 'authoring.pagesAndResources.teams.group.types.open',
    defaultMessage: 'Open',
  },
  groupTypeOpenManaged: {
    id: 'authoring.pagesAndResources.teams.group.types.open_managed',
    defaultMessage: 'Open managed',
  },
  groupTypeOpenManagedDescription: {
    id: 'authoring.pagesAndResources.teams.group.types.open_managed.description',
    defaultMessage: 'Only course staff can create teams. Learners can see, join and leave teams.',
  },
  groupTypeOpenDescription: {
    id: 'authoring.pagesAndResources.teams.group.types.open.description',
    defaultMessage: 'Learners can create, join, leave, and see other teams',
  },
  groupTypePublicManaged: {
    id: 'authoring.pagesAndResources.teams.group.types.public_managed',
    defaultMessage: 'Public managed',
  },
  groupTypePublicManagedDescription: {
    id: 'authoring.pagesAndResources.teams.group.types.public_managed.description',
    defaultMessage: 'Only course staff can control teams and memberships. Learners can see other teams.',
  },
  groupTypePrivateManaged: {
    id: 'authoring.pagesAndResources.teams.group.types.private_managed',
    defaultMessage: 'Private managed',
  },
  groupTypePrivateManagedDescription: {
    id: 'authoring.pagesAndResources.teams.group.types.private_managed.description',
    defaultMessage: 'Only course staff can control teams, memberships, and see other teams',
  },
  groupFormMaxSizeLabel: {
    id: 'authoring.pagesAndResources.teams.group.maxSize.label',
    defaultMessage: 'Max team size (optional)',
  },
  groupFormMaxSizeHelp: {
    id: 'authoring.pagesAndResources.teams.group.maxSize.help',
    defaultMessage: 'Override the global max team size',
  },
  addGroup: {
    id: 'authoring.pagesAndResources.teams.addGroup.button',
    defaultMessage: 'Add group',
  },
  deleteAlt: {
    id: 'authoring.pagesAndResources.teams.group.delete',
    defaultMessage: 'Delete',
  },
  expandAlt: {
    id: 'authoring.pagesAndResources.teams.group.expand',
    defaultMessage: 'Expand group editor',
  },
  collapseAlt: {
    id: 'authoring.pagesAndResources.teams.group.collapse',
    defaultMessage: 'Close group editor',
  },
  delete: {
    id: 'authoring.pagesAndResources.teams.deleteGroup.initiateDelete',
    defaultMessage: 'Delete',
  },
  cancel: {
    id: 'authoring.pagesAndResources.teams.deleteGroup.cancel-delete.button',
    defaultMessage: 'Cancel',
  },
  groupDeleteHeading: {
    id: 'authoring.pagesAndResources.teams.deleteGroup.heading',
    defaultMessage: 'Delete this group?',
  },
  groupDeleteBody: {
    id: 'authoring.pagesAndResources.teams.deleteGroup.body',
    defaultMessage: `edX recommends that you do not delete groups once your course is running.
    Your group will no longer be visible in the LMS and learners will not be able to leave teams associated with it.
    Please delete learners from teams before deleting the associated group.`,
    description: 'Message displayed to admins when deleting a group. Make sure to include line breaks so that the final text is rendered properly.',
  },
  noGroupsErrorTitle: {
    id: 'authoring.pagesAndResources.teams.enableGroups.error.noGroupsFound.title',
    defaultMessage: 'No groups found',
    description: 'Title of error message displayed when a user tries to enable teams but no group is defined.',
  },
  noGroupsErrorMessage: {
    id: 'authoring.pagesAndResources.teams.enableGroups.error.noGroupsFound.message',
    defaultMessage: 'Add one or more groups to enable teams.',
    description: 'Body of error message displayed when a user tries to enable teams but no group is defined.',
  },
});

export default messages;
