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
    defaultMessage: `Define the structure of teams in your course by adding
    team-sets; groups focussed around specific topics you create`,
  },
  enableTeamsLink: {
    id: 'authoring.pagesAndResources.teams.enableTeams.link',
    defaultMessage: 'Learn more about the teams',
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
    defaultMessage: 'The name learners will see when interacting with your team-set',
  },
  teamSetFormNameError: {
    id: 'authoring.pagesAndResources.teams.teamSet.name.error',
    defaultMessage: 'Team set name can\'t be blank',
  },
  teamSetFormDescriptionLabel: {
    id: 'authoring.pagesAndResources.teams.teamSet.description.label',
    defaultMessage: 'Description',
  },
  teamSetFormDescriptionHelp: {
    id: 'authoring.pagesAndResources.teams.teamSet.description.help',
    defaultMessage: 'Details about your team-set, displayed below the team-set name.',
  },
  teamSetFormDescriptionError: {
    id: 'authoring.pagesAndResources.teams.teamSet.description.error',
    defaultMessage: 'Team set description can\'t be blank.',
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
  teamSetTypePublicManaged: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.public_managed',
    defaultMessage: 'Public Managed',
  },
  teamSetTypePrivateManaged: {
    id: 'authoring.pagesAndResources.teams.teamSet.types.private_managed',
    defaultMessage: 'Private Managed',
  },
  teamSetFormMaxSizeLabel: {
    id: 'authoring.pagesAndResources.teams.teamSet.maxSize.label',
    defaultMessage: 'Max team size',
  },
  teamSetFormMaxSizeHelp: {
    id: 'authoring.pagesAndResources.teams.teamSet.maxSize.help',
    defaultMessage: 'The maximum number of learners that can join a team',
  },
  teamSetFormMaxSizeError: {
    id: 'authoring.pagesAndResources.teams.teamSet.maxSize.error',
    defaultMessage: 'The maximum team size must be a number between {min} and {max}',
  },
  addTeamSet: {
    id: 'authoring.pagesAndResources.teams.addTeamSet.button',
    defaultMessage: 'Add team-set',
  },
  delete: {
    id: 'authoring.pagesAndResources.teams.deleteTeamSet.delete.button',
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
    defaultMessage: `EdX recommends that you do not delete team-sets once your
    course is running. Your team-set will no longer be visible in the LMS and
    learners will not be able to leave teams associated with it. Please delete
    learners from teams before deleting the associated teamSet.`,
  },
});

export default messages;
