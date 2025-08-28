import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  alertTitle: {
    id: 'studio-home.legacy-libraries.migrate-alert.title',
    defaultMessage: 'Migrate Legacy Libraries',
    description: 'Title for the alert message to migrate legacy libraries',
  },
  alertDescription: {
    id: 'studio-home.legacy-libraries.migrate-alert.description',
    defaultMessage: 'In a future release, legacy libraries will no longer be supported.'
      + ' The new libraries experience allows you to author sections, subsections, units,'
      + ' and components to reuse across your courses. Content from legacy libraries can be'
      + ' migrated to the new experience.',
    description: 'Description for the alert message to migrate legacy libraries',
  },
  alertReviewButton: {
    id: 'studio-home.legacy-libraries.migrate-alert.review-button',
    defaultMessage: 'Review Legacy Libraries',
    description: 'Label for the button to review legacy libraries',
  },
});

export default messages;
