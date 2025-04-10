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
  importWizardStepExportBody: {
    id: 'course-authoring.import-tags.wizard.step-export.body',
    defaultMessage: 'To update this taxonomy you need to import a new CSV or JSON file. The current taxonomy will '
      + 'be completely replaced by the contents of the imported file (e.g. if a tag in the current taxonomy is not '
      + 'present in the imported file, it will be removed - both from the taxonomy and from any tagged course '
      + 'content).'
      + '{br}You may wish to export the taxonomy in its current state before importing the new file.',
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
  importWizardStepUploadBody: {
    id: 'course-authoring.import-tags.wizard.step-upload.body',
    defaultMessage: 'You can upload a CSV or JSON file to create a new taxonomy. You may use any spreadsheet tool '
    + '(for CSV files), or any text editor (for JSON files) to create the file that you wish to import. '
    + 'For an example of the required format, download the {csvTemplateUrl} or {jsonTemplateUrl}.'
    + '{br}Once the file is ready to be imported, drag and drop it into the box below, or click to upload.',
  },
  importWizardStepReuploadBody: {
    id: 'course-authoring.import-tags.wizard.step-reupload.body',
    defaultMessage: 'You may use any spreadsheet tool (for CSV files), or any text editor (for JSON files) to create '
    + 'the file that you wish to import.'
    + '{br}Once the file is ready to be imported, drag and drop it into the box below, or click to upload.',
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
  importWizardStepPlanTitle: {
    id: 'course-authoring.import-tags.wizard.step-plan.title',
    defaultMessage: 'Differences between files',
  },
  importWizardStepPlanBody: {
    id: 'course-authoring.import-tags.wizard.step-plan.body',
    defaultMessage: 'Importing this file will make {changeCount} updates to the existing taxonomy. '
    + 'The content of the imported file will replace any existing values that do not match the new values.'
    + '{br}Importing this file will cause the following updates:',
  },
  importWizardStepPlanNoChanges: {
    id: 'course-authoring.import-tags.wizard.step-plan.no-changes',
    defaultMessage: 'No changes',
  },
  importWizardStepConfirmTitle: {
    id: 'course-authoring.import-tags.wizard.step-confirm.title',
    defaultMessage: 'Import and replace tags',
  },
  importWizardStepConfirmBody: {
    id: 'course-authoring.import-tags.wizard.step-confirm.body',
    defaultMessage: 'Warning! You are about to make {changeCount} changes to the existing taxonomy. Any tags applied '
    + 'to course content will be updated or removed. This cannot be undone.'
    + '{br}Are you sure you want to continue importing this file?',
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
    defaultMessage: "Enter a Export ID for the new taxonomy. Should only contain alphanumeric characters or '_' '-' '.'",
  },
  promptTaxonomyExportIdRequired: {
    id: 'course-authoring.import-tags.prompt.taxonomy-export-id.required',
    defaultMessage: 'You must enter an Export ID for the new taxonomy.',
  },
  promptTaxonomyExportIdInvalid: {
    id: 'course-authoring.import-tags.prompt.taxonomy-export-id.invalid',
    defaultMessage: "Invalid Export ID. Should only contain alphanumeric characters or '_' '-' '.'",
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
});

export default messages;
