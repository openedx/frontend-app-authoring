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
      + ' be migrated to this new library, organized into collections. Legacy library content used in courses will'
      + ' continue to work as-is. To receive any future changes to migrated content, you must update these'
      + ' references within your course.',
    description: 'Alert text in the select destination step of the legacy libraries migration page.',
  },
  confirmationViewAlert: {
    id: 'legacy-libraries-migration.select-destination.alert.text',
    defaultMessage: 'All content from the'
      + ' {count, plural, one {{count} legacy library} other {{count} legacy libraries}} you selected will'
      + ' be migrated to <b>{libraryName}</b>, organized into collections. Legacy library content used in courses will'
      + ' continue to work as-is. To receive any future changes to migrated content, you must update these'
      + ' references within your course.',
    description: 'Alert text in the confirmation step of the legacy libraries migration page.',
  },
  previouslyMigratedAlert: {
    id: 'legacy-libraries-migration.confirmation-step.card.previously-migrated.text',
    defaultMessage: 'Previously migrated library. Any problem bank links were already'
    + ' moved will be migrated to <b>{libraryName}</b>',
    description: 'Alert text when the legacy library is already migrated.',
  },
  helpAndSupportTitle: {
    id: 'legacy-libraries-migration.helpAndSupport.title',
    defaultMessage: 'Help & Support',
    description: 'Title of the Help & Support sidebar',
  },
  helpAndSupportFirstQuestionTitle: {
    id: 'legacy-libraries-migration.helpAndSupport.q1.title',
    defaultMessage: 'What’s different in the new Content Libraries experience?',
    description: 'Title of the first question in the Help & Support sidebar',
  },
  helpAndSupportFirstQuestionBody: {
    id: 'legacy-libraries-migration.helpAndSupport.q1.body',
    defaultMessage: 'In the new Content Libraries experience, you can author sections,'
    + ' subsections, units, and many types of components. Library content can be reused across many courses,'
    + ' and kept up-to-date. Content libraries now support increased collaboration across authoring teams.',
    description: 'Body of the first question in the Help & Support sidebar',
  },
  helpAndSupportSecondQuestionTitle: {
    id: 'legacy-libraries-migration.helpAndSupport.q2.title',
    defaultMessage: 'What happens when I migrate my Legacy Libraries?',
    description: 'Title of the second question in the Help & Support sidebar',
  },
  helpAndSupportSecondQuestionBody: {
    id: 'legacy-libraries-migration.helpAndSupport.q2.body',
    defaultMessage: 'All legacy library content is supported in the new experience.'
    + ' Content from legacy libraries will be migrated to its own collection in the new Content Libraries experience.'
    + ' This collection will have the same name as your original library. Courses that use legacy library content will'
    + ' continue to function as usual, linked to the migrated version within the new libraries experience.',
    description: 'Body of the second question in the Help & Support sidebar',
  },
  helpAndSupportThirdQuestionTitle: {
    id: 'legacy-libraries-migration.helpAndSupport.q3.title',
    defaultMessage: 'How do I migrate my Legacy Libraries?',
    description: 'Title of the third question in the Help & Support sidebar',
  },
  helpAndSupportThirdQuestionBody: {
    id: 'legacy-libraries-migration.helpAndSupport.q3.body.2',
    defaultMessage: '<p>There are three steps to migrating legacy libraries:</p>'
    + '<p><div>1 - Select Legacy Libraries</div>'
    + 'You can select up to 50 legacy libraries for migration in this step. By default, only libraries that have'
    + ' not yet been migrated are shown. To see all libraries, remove the filter.'
    + ' You can select up to 50 legacy libraries for migration, but only one destination'
    + ' v2 Content Library per migration.</p>'
    + '<p><div>2 - Select Destination</div>'
    + 'You can migrate legacy libraries to an existing Content Library in the new experience,'
    + ' or you can create a new destination. You can only select one v2 Content Library per migration.'
    + ' All your content will be migrated, and kept organized in collections.</p>'
    + '<p><div>3 - Confirm</div>'
    + 'In this step, review your migration. Once you confirm, migration will begin.'
    + ' It may take some time to complete.</p>',
    description: 'Part 2 of the Body of the third question in the Help & Support sidebar',
  },
  migrationInProgress: {
    id: 'legacy-libraries-migration.confirmation-step.toast.migration-in-progress',
    defaultMessage: '{count, plural, one {{count} legacy library is} other {{count} legacy libraries are}} being migrated.',
    description: 'Toast message that indicates the legacy libraries are being migrated',
  },
  migrationFailed: {
    id: 'legacy-libraries-migration.confirmation-step.toast.migration-failed',
    defaultMessage: 'Legacy libraries migration have failed',
    description: 'Toast message that indicates the migration of legacy libraries is failed',
  },
  migrationFailedMultiple: {
    id: 'legacy-libraries-migration.confirmation-step.toast.migration-multiple-failed',
    defaultMessage: 'Multiple legacy libraries have failed',
    description: 'Toast message that indicates the migration of legacy libraries is failed',
  },
  migrationFailedOneLibrary: {
    id: 'legacy-libraries-migration.confirmation-step.toast.migration-one-failed',
    defaultMessage: 'The legacy library with this key has failed: {key}',
    description: 'Toast message that indicates that one legacy library has failed in the migration',
  },
  migrationSuccess: {
    id: 'legacy-libraries-migration.confirmation-step.toast.migration-success',
    defaultMessage: 'The migration of legacy libraries has been completed successfully.',
    description: 'Toast message that indicates the migration of legacy libraries is finished',
  },
});

export default messages;
