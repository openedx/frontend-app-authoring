import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  titleId: {
    id: 'course-authoring.group-configurations.container.title-id',
    defaultMessage: 'ID: {id}',
    description: 'Message for the title of a container within group configurations section',
  },
  accessTo: {
    id: 'course-authoring.group-configurations.container.access-to',
    defaultMessage: 'This group controls access to:',
    description: 'Indicates that the units are contained in content group',
  },
  experimentAccessTo: {
    id: 'course-authoring.group-configurations.experiment-card.experiment-access-to',
    defaultMessage: 'This group configuration is used in:',
    description: 'Indicates that the units are contained in experiment configurations',
  },
});

export default messages;
