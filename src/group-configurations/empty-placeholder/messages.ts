import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.group-configurations.empty-placeholder.title',
    defaultMessage: 'You have not created any content groups yet.',
    description: 'Title displayed when there are no content groups created yet.',
  },
  experimentalTitle: {
    id: 'course-authoring.group-configurations.experimental-empty-placeholder.title',
    defaultMessage: 'You have not created any group configurations yet.',
    description: 'Title displayed when there are no experimental group configurations created yet.',
  },
  button: {
    id: 'course-authoring.group-configurations.empty-placeholder.button',
    defaultMessage: 'Add your first content group',
    description: 'Label for the button to add the first content group when none exist.',
  },
  experimentalButton: {
    id: 'course-authoring.group-configurations.experimental-empty-placeholder.button',
    defaultMessage: 'Add your first group configuration',
    description: 'Label for the button to add the first experimental group configuration when none exist.',
  },
});

export default messages;
