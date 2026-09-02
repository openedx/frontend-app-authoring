import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  importWizardButtonCancel: {
    id: 'course-authoring.import-tags.wizard.button.cancel',
    defaultMessage: 'Cancel',
  },
  importWizardButtonNext: {
    id: 'course-authoring.import-tags.wizard.button.next',
    defaultMessage: 'Next',
  },
  importWizardButtonPrevious: {
    id: 'course-authoring.import-tags.wizard.button.previous',
    defaultMessage: 'Previous',
  },
  importWizardButtonImport: {
    id: 'course-authoring.import-tags.wizard.button.import',
    defaultMessage: 'Import',
  },
  importWizardButtonContinue: {
    id: 'course-authoring.import-tags.wizard.button.continue',
    defaultMessage: 'Continue',
  },
  importWizardButtonConfirm: {
    id: 'course-authoring.import-tags.wizard.button.confirm',
    defaultMessage: 'Yes, import file',
  },
  importWizardStepExportTitle: {
    id: 'course-authoring.import-tags.wizard.step-export.title',
    defaultMessage: 'Update "{name}"',
  },
  importWizardStepExportReplaceWarning: {
    id: 'course-authoring.import-tags.wizard.step-export.replace-warning',
    defaultMessage: 'To update this taxonomy you need to import a new CSV or JSON file. The current taxonomy will '
      + 'be completely replaced by the contents of the imported file (e.g. if a tag in the current taxonomy is not '
      + 'present in the imported file, it will be removed - both from the taxonomy and from any tagged course '
      + 'content).',
    description: 'Warning on the first step of the re-import wizard, explaining that the imported file replaces the '
      + 'whole taxonomy rather than being merged into it.',
  },
  importWizardStepExportBackupSuggestion: {
    id: 'course-authoring.import-tags.wizard.step-export.backup-suggestion',
    defaultMessage: 'You may wish to export the taxonomy in its current state before importing the new file.',
    description: 'Advice on the first step of the re-import wizard, suggesting the user export a backup of the '
      + 'taxonomy before replacing it.',
  },
  importWizardStepExportCSVButton: {
    id: 'course-authoring.import-tags.wizard.step-export.button-csv',
    defaultMessage: 'CSV file',
  },
  importWizardStepExportJSONButton: {
    id: 'course-authoring.import-tags.wizard.step-export.button-json',
    defaultMessage: 'JSON file',
  },
  importWizardStepUploadTitle: {
    id: 'course-authoring.import-tags.wizard.step-upload.title',
    defaultMessage: 'Upload file',
  },
  importWizardStepUploadClearFile: {
    id: 'course-authoring.import-tags.wizard.step-upload.clear-file',
    defaultMessage: 'Clear file',
  },
  importWizardStepUploadFormatInfo: {
    id: 'course-authoring.import-tags.wizard.step-upload.format-info',
    defaultMessage: 'You can upload a CSV or JSON file to create a new taxonomy. You may use any spreadsheet tool '
      + '(for CSV files), or any text editor (for JSON files) to create the file that you wish to import. '
      + 'For an example of the required format, download the <csvLink>{csvTemplateTitle}</csvLink> or '
      + '<jsonLink>{jsonTemplateTitle}</jsonLink>.',
    description: 'Explains which file formats can be used to create a new taxonomy. The link text comes from the "CSV '
      + 'template" and "JSON template" messages.',
  },
  importWizardStepReuploadFormatInfo: {
    id: 'course-authoring.import-tags.wizard.step-reupload.format-info',
    defaultMessage: 'You may use any spreadsheet tool (for CSV files), or any text editor (for JSON files) to create '
      + 'the file that you wish to import.',
    description: 'Explains which tools can be used to prepare the file when re-importing tags into an existing '
      + 'taxonomy.',
  },
  importWizardStepUploadDropInstruction: {
    id: 'course-authoring.import-tags.wizard.step-upload.drop-instruction',
    defaultMessage: 'Once the file is ready to be imported, drag and drop it into the box below, or click to upload.',
    description: 'Instruction above the drag-and-drop area of the upload step.',
  },
  csvTemplateTitle: {
    id: 'course-authoring.import-tags.wizard.step-upload.csv-template',
    defaultMessage: 'CSV template',
  },
  jsonTemplateTitle: {
    id: 'course-authoring.import-tags.wizard.step-upload.json-template',
    defaultMessage: 'JSON template',
  },
  importWizardStepPopulateTitle: {
    id: 'course-authoring.import-tags.wizard.step-populate.title',
    defaultMessage: 'Populate Taxonomy Information',
  },
  importWizardStepPopulateTaxonomyName: {
    id: 'course-authoring.import-tags.wizard.step-populate.name',
    defaultMessage: 'Taxonomy Name',
  },
  importWizardStepPopulateTaxonomyDesc: {
    id: 'course-authoring.import-tags.wizard.step-populate.desc',
    defaultMessage: 'Taxonomy Description',
  },
  importWizardStepPopulateTaxonomyType: {
    id: 'course-authoring.import-tags.wizard.step-populate.type',
    defaultMessage: 'Taxonomy Type',
    description: 'Label for the dropdown where the user selects the type of taxonomy being imported.',
  },
  importWizardStepPopulateTaxonomyTypeTags: {
    id: 'course-authoring.import-tags.wizard.step-populate.type.tags',
    defaultMessage: 'Tags',
    description: 'Option in the Taxonomy Type dropdown for a standard tag taxonomy.',
  },
  importWizardStepPopulateTaxonomyTypeCompetency: {
    id: 'course-authoring.import-tags.wizard.step-populate.type.competency',
    defaultMessage: 'Competency',
    description: 'Option in the Taxonomy Type dropdown for a competency taxonomy.',
  },
  importWizardStepPlanTitle: {
    id: 'course-authoring.import-tags.wizard.step-plan.title',
    defaultMessage: 'Differences between files',
  },
  importWizardStepPlanSummary: {
    id: 'course-authoring.import-tags.wizard.step-plan.summary',
    defaultMessage: 'Importing this file will make {changeCount} updates to the existing taxonomy. '
      + 'The content of the imported file will replace any existing values that do not match the new values.',
    description: 'Summary at the top of the wizard step that previews an import. {changeCount} is the number of '
      + 'changes the import will make.',
  },
  importWizardStepPlanListLabel: {
    id: 'course-authoring.import-tags.wizard.step-plan.list-label',
    defaultMessage: 'Importing this file will cause the following updates:',
    description: 'Introduces the list of individual changes an import will make, shown on the preview step.',
  },
  importWizardStepPlanNoChanges: {
    id: 'course-authoring.import-tags.wizard.step-plan.no-changes',
    defaultMessage: 'No changes',
  },
  importWizardStepConfirmTitle: {
    id: 'course-authoring.import-tags.wizard.step-confirm.title',
    defaultMessage: 'Import and replace tags',
  },
  importWizardStepConfirmWarning: {
    id: 'course-authoring.import-tags.wizard.step-confirm.warning',
    defaultMessage: 'Warning! You are about to make {changeCount} changes to the existing taxonomy. Any tags applied '
      + 'to course content will be updated or removed. This cannot be undone.',
    description: 'Warning on the final confirmation step, shown before the import is applied. {changeCount} is the '
      + 'number of changes the import will make.',
  },
  importWizardStepConfirmQuestion: {
    id: 'course-authoring.import-tags.wizard.step-confirm.question',
    defaultMessage: 'Are you sure you want to continue importing this file?',
    description: 'Question on the final confirmation step, asking the user to confirm the import.',
  },
  promptTaxonomyName: {
    id: 'course-authoring.import-tags.prompt.taxonomy-name',
    defaultMessage: 'Enter a name for the new taxonomy',
  },
  promptTaxonomyNameRequired: {
    id: 'course-authoring.import-tags.prompt.taxonomy-name.required',
    defaultMessage: 'You must enter a name for the new taxonomy',
  },
  promptTaxonomyExportId: {
    id: 'course-authoring.import-tags.prompt.taxonomy-export-id',
    defaultMessage: 'Enter a Export ID for the new taxonomy. Should only contain alphanumeric characters or \'_\' \'-\' \'.\'',
  },
  promptTaxonomyExportIdRequired: {
    id: 'course-authoring.import-tags.prompt.taxonomy-export-id.required',
    defaultMessage: 'You must enter an Export ID for the new taxonomy.',
  },
  promptTaxonomyExportIdInvalid: {
    id: 'course-authoring.import-tags.prompt.taxonomy-export-id.invalid',
    defaultMessage: 'Invalid Export ID. Should only contain alphanumeric characters or \'_\' \'-\' \'.\'',
  },
  promptTaxonomyDescription: {
    id: 'course-authoring.import-tags.prompt.taxonomy-description',
    defaultMessage: 'Enter a description for the new taxonomy',
  },
  importTaxonomySuccess: {
    id: 'course-authoring.import-tags.success',
    defaultMessage: 'Taxonomy imported successfully',
  },
  importTaxonomyError: {
    id: 'course-authoring.import-tags.error',
    defaultMessage: 'Import failed - see details in the browser console',
  },
  importNewTaxonomyToast: {
    id: 'course-authoring.import-tags.new.toast.success',
    defaultMessage: '"{name}" imported',
  },
  importTaxonomyToast: {
    id: 'course-authoring.import-tags.toast.success',
    defaultMessage: '"{name}" updated',
  },
  importTaxonomyErrorAlert: {
    id: 'course-authoring.import-tags.error-alert.title',
    defaultMessage: 'Import error',
  },
  importWizardStepperExportStepTitle: {
    id: 'course-authoring.import-tags.wizard.stepper.export-step.title',
    defaultMessage: 'Export',
  },
  importWizardStepperUploadStepTitle: {
    id: 'course-authoring.import-tags.wizard.stepper.upload-step.title',
    defaultMessage: 'Upload',
  },
  importWizardStepperPopulateStepTitle: {
    id: 'course-authoring.import-tags.wizard.stepper.populate-step.title',
    defaultMessage: 'Populate',
  },
  importWizardStepperPlanStepTitle: {
    id: 'course-authoring.import-tags.wizard.stepper.plan-step.title',
    defaultMessage: 'Plan',
  },
  importWizardStepperConfirmStepTitle: {
    id: 'course-authoring.import-tags.wizard.stepper.confirm-step.title',
    defaultMessage: 'Confirm',
  },
});

export default messages;
