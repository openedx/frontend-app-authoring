import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.group-configurations.empty-placeholder.title',
    defaultMessage: 'You have not created any content groups yet.',
  },
  experimentalTitle: {
    id: 'course-authoring.group-configurations.experimental-empty-placeholder.title',
    defaultMessage: 'You have not created any group configurations yet.',
  },
  button: {
    id: 'course-authoring.group-configurations.empty-placeholder.button',
    defaultMessage: 'Add your first content group',
  },
  experimentalButton: {
    id: 'course-authoring.group-configurations.experimental-empty-placeholder.button',
    defaultMessage: 'Add your first group configuration',
  },
});

export default messages;
