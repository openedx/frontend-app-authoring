import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  exportModalTitle: {
    id: 'course-authoring.taxonomy-list.modal.export.title',
    defaultMessage: 'Select format to export',
  },
  exportModalBodyDescription: {
    id: 'course-authoring.taxonomy-list.modal.export.body',
    defaultMessage: 'Select the file format in which you would like the taxonomy to be exported:',
  },
  exportModalSubmitButtonLabel: {
    id: 'course-authoring.taxonomy-list.modal.export.submit.label',
    defaultMessage: 'Export',
  },
  taxonomyCSVFormat: {
    id: 'course-authoring.taxonomy-list.csv-format',
    defaultMessage: 'CSV file',
  },
  taxonomyJSONFormat: {
    id: 'course-authoring.taxonomy-list.json-format',
    defaultMessage: 'JSON file',
  },
  taxonomyModalsCancelLabel: {
    id: 'course-authoring.taxonomy-list.modal.cancel',
    defaultMessage: 'Cancel',
  },
});

export default messages;
