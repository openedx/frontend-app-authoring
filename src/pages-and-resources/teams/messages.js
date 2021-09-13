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
    defaultMessage: 'Create team-sets to allow learners to work in small groups on specific projects of activities.',
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
    id: 'authoring.pagesAndResources.teams.teamSize.maxTeamSizeInvalid',
    defaultMessage: 'Enter max team size',
  },
  maxTeamSizeTooHigh: {
    id: 'authoring.pagesAndResources.teams.teamSize.maxTeamSizeTooHigh',
    defaultMessage: 'Max team size must less than {max}',
  },
  teamSets: {
    id: 'authoring.pagesAndResources.teams.teamSets.heading',
    defaultMessage: 'Team-sets',
  },
  configureTeamSet: {
    id: 'authoring.pagesAndResources.teams.configureTeamSet.heading',
    defaultMessage: 'Configure team-set',
  },
  teamSetFormNameLabel: {
    id: 'authoring.pagesAndResources.teams.teamSet.name.label',
    defaultMessage: 'Name',
  },
  teamSetFormNameHelp: {
    id: 'authoring.pagesAndResources.teams.teamSet.name.help',
    defaultMessage: 'Choose a unique name for your team-set',
  },
  teamSetFormNameEmpty: {
    id: 'authoring.pagesAndResources.teams.teamSet.name.error.empty',
    defaultMessage: 'Enter a unique name for your team set',
  },
  teamSetFormNameExists: {
    id: 'authoring.pagesAndResources.teams.teamSet.name.error.exists',
    defaultMessage: 'It looks like this name is already in use',
  },
  teamSetFormDescriptionLabel: {
    id: 'authoring.pagesAndResources.teams.teamSet.description.label',
    defaultMessage: 'Description',
  },
  teamSetFormDescriptionHelp: {
    id: 'authoring.pagesAndResources.teams.teamSet.description.help',
    defaultMessage: 'Details about your team-set',
  },
  teamSetFormDescriptionError: {
    id: 'authoring.pagesAndResources.teams.teamSet.description.error',
    defaultMessage: 'Enter a description for your team-set',
  },
  teamSetFormTypeLabel: {
    id: 'authoring.pagesAndResources.teams.teamSet.type.label',
    defaultMessage: 'Type',
  },
  teamSetFormTypeHelp: {
    id: 'authoring.pagesAndResources.teams.teamSet.type.help',
    defaultMessage: 'Control who can see, create and join teams',
  },
  teamSetTypeOpen: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.open',
    defaultMessage: 'Open',
  },
  teamSetTypeOpenDescription: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.open.description',
    defaultMessage: 'Learners can create, join, leave, and see other teams',
  },
  teamSetTypePublicManaged: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.public_managed',
    defaultMessage: 'Public Managed',
  },
  teamSetTypePublicManagedDescription: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.public_managed.description',
    defaultMessage: 'Only course staff can control teams and memberships. Learners can see other teams.',
  },
  teamSetTypePrivateManaged: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.private_managed',
    defaultMessage: 'Private Managed',
  },
  teamSetTypePrivateManagedDescription: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.private_managed.description',
    defaultMessage: 'Only course staff can control teams, memberships, and see other teams',
  },
  teamSetFormMaxSizeLabel: {
    id: 'authoring.pagesAndResources.teams.teamSet.maxSize.label',
    defaultMessage: 'Max team size (optional)',
  },
  teamSetFormMaxSizeHelp: {
    id: 'authoring.pagesAndResources.teams.teamSet.maxSize.help',
    defaultMessage: 'Override the global max team size',
  },
  addTeamSet: {
    id: 'authoring.pagesAndResources.teams.addTeamSet.button',
    defaultMessage: 'Add team-set',
  },
  deleteAlt: {
    id: 'authoring.pagesAndResources.teams.teamsSet.delete',
    defaultMessage: 'Delete',
  },
  expandAlt: {
    id: 'authoring.pagesAndResources.teams.teamsSet.expand',
    defaultMessage: 'Expand team set editor',
  },
  collapseAlt: {
    id: 'authoring.pagesAndResources.teams.teamSet.collapse',
    defaultMessage: 'Close team set editor',
  },
  delete: {
    id: 'authoring.pagesAndResources.teams.deleteTeamSet.initiateDelete',
    defaultMessage: 'Delete',
  },
  cancel: {
    id: 'authoring.pagesAndResources.teams.deleteTeamSet.cancel-delete.button',
    defaultMessage: 'Cancel',
  },
  teamSetDeleteHeading: {
    id: 'authoring.pagesAndResources.teams.deleteTeamSet.heading',
    defaultMessage: 'Delete team-set?',
  },
  teamSetDeleteBody: {
    id: 'authoring.pagesAndResources.teams.deleteTeamSet.body',
    defaultMessage: 'edX recommends that you do not delete team-sets once your course is running.',
  },
});

export default messages;
