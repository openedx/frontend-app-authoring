import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  siteTitle: {
    id: 'legacy-libraries-migration.site-title',
    defaultMessage: 'Migrate Legacy Libraries',
    description: 'Title for the page to migrate legacy libraries.',
  },
  cancel: {
    id: 'legacy-libraries-migration.button.cancel',
    defaultMessage: 'Cancel',
    description: 'Text of the button to cancel the migration.',
  },
  next: {
    id: 'legacy-libraries-migration.button.next',
    defaultMessage: 'Next',
    description: 'Text of the button to go to the next step of the migration.',
  },
  back: {
    id: 'legacy-libraries-migration.button.back',
    defaultMessage: 'Back',
    description: 'Text of the button to go back to the previous step of the migration.',
  },
  confirm: {
    id: 'legacy-libraries-migration.button.confirm',
    defaultMessage: 'Confirm',
    description: 'Text of the button to confirm the migration.',
  },
  selectLegacyLibrariesStepTitle: {
    id: 'legacy-libraries-migration.select-legacy-libraries-step.title',
    defaultMessage: 'Select Legacy Libraries',
    description: 'Title of the Select Legacy Libraries step',
  },
  selectDestinationStepTitle: {
    id: 'legacy-libraries-migration.select-destination-step.title',
    defaultMessage: 'Select Destination',
    description: 'Title of the Select Destination step',
  },
  confirmStepTitle: {
    id: 'legacy-libraries-migration.confirm-step.title',
    defaultMessage: 'Confirm',
    description: 'Title of the Confirm step',
  },
  exitModalTitle: {
    id: 'legacy-libraries-migration.exit-modal.title',
    defaultMessage: 'Exit Migration?',
    description: 'Title of the modal to confirm exit the migration.',
  },
  exitModalBodyText: {
    id: 'legacy-libraries-migration.exit-modal.body',
    defaultMessage: 'By exiting, all changes will be lost and no libraries will be migrated.',
    description: 'Body text of the modal to confirm exit the migration.',
  },
  exitModalCancelText: {
    id: 'legacy-libraries-migration.exit-modal.button.cancel.text',
    defaultMessage: 'Continue Migrating',
    description: 'Text for the button to close the modal to confirm exit the migration.',
  },
  exitModalConfirmText: {
    id: 'legacy-libraries-migration.exit-modal.button.confirm.text',
    defaultMessage: 'Exit',
    description: 'Text for the button to confirm exit the migration.',
  },
  selectDestinationAlert: {
    id: 'legacy-libraries-migration.select-destination.alert.text',
    defaultMessage: 'All content from the'
      + ' {count, plural, one {{count} legacy library} other {{count} legacy libraries}} you selected will'
      + ' be migrated to this new library, organized into collections. Any legacy libraries that are used in'
      + ' problem banks will maintain their link with migrated content the first time they are migrated.',
    description: 'Alert text in the select destination step of the legacy libraries migration page.',
  },
  confirmationViewAlert: {
    id: 'legacy-libraries-migration.select-destination.alert.text',
    defaultMessage: 'These {count, plural, one {{count} legacy library} other {{count} legacy libraries}}'
      + ' will be migrated to <b>{libraryName}</b> and organized as collections. Any legacy libraries that are used in'
      + ' problem banks will maintain their link with migrated content the first time they are migrated.',
    description: 'Alert text in the confirmation step of the legacy libraries migration page.',
  },
  previouslyMigratedAlert: {
    id: 'legacy-libraries-migration.confirmation-step.card.previously-migrated.text',
    defaultMessage: 'Previously migrated library. Any problem bank links were already'
    + ' moved will be migrated to <b>{libraryName}</b>',
    description: 'Alert text when the legacy library is already migrated.',
  },
});

export default messages;
