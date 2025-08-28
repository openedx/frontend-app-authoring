import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  alertTitleMigrationPending: {
    id: 'studio-home.libraries.welcome-alert.title.migration-pending',
    defaultMessage: 'Migrate Legacy Libraries',
    description: 'Title for the alert message while there are libraries pending migration.',
  },
  alertDescription: {
    id: 'studio-home.libraries.welcome-alert.description',
    defaultMessage: 'Welcome to the new Content Libraries experience! Libraries have been redesigned'
      + ' from the ground up, making it much easier to reuse content. You can create, organize and manage'
      + ' new content, reuse your content in as many courses as you\'d like, publish updates, and create/randomize'
      + ' problem sets. See {link} for details.',
    description: 'Description for the alert message while there are no libraries pending migration.',
  },
  alertDescriptionMigrationPending: {
    id: 'studio-home.libraries.welcome-alert.description.migration-pending',
    defaultMessage: ' Legacy libraries can be migrated using the migration tool.',
    description: 'Complementary description for the alert message while there are libraries pending migration.',
  },
  alertReviewButton: {
    id: 'studio-home.libraries.welcome-alert.review-button',
    defaultMessage: 'Review Legacy Libraries',
    description: 'Label for the button to review legacy libraries',
  },
  alertLibrariesDocLinkText: {
    id: 'studio-home.libraries.welcome-alert.docs',
    defaultMessage: 'Libraries documentation',
    description: 'Link text for the libraries documentation link.',
  },
});

export default messages;
