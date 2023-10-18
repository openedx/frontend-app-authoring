import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headerTitle: {
    id: 'course-authoring.taxonomy-list.header.title',
    defaultMessage: 'Taxonomies',
  },
  downloadTemplateButtonLabel: {
    id: 'course-authoring.taxonomy-list.button.download-template.label',
    defaultMessage: 'Download template',
  },
  importButtonLabel: {
    id: 'course-authoring.taxonomy-list.button.import.label',
    defaultMessage: 'Import',
  },
  orgInputSelectDefaultValue: {
    id: 'course-authoring.taxonomy-list.select.org.default',
    defaultMessage: 'All taxonomies',
  },
  systemDefinedBadge: {
    id: 'course-authoring.taxonomy-list.badge.system-defined.label',
    defaultMessage: 'System-level',
  },
  assignedToOrgsLabel: {
    id: 'course-authoring.taxonomy-list.orgs-count.label',
    defaultMessage: 'Assigned to {orgsCount} orgs',
  },
  usageLoadingMessage: {
    id: 'course-authoring.taxonomy-list.spinner.loading',
    defaultMessage: 'Loading',
  },
  systemTaxonomyPopoverTitle: {
    id: 'course-authoring.taxonomy-list.popover.system-defined.title',
    defaultMessage: 'System taxonomy',
  },
  systemTaxonomyPopoverBody: {
    id: 'course-authoring.taxonomy-list.popover.system-defined.body',
    defaultMessage: 'This is a system-level taxonomy and is enabled by default.',
  },
  taxonomyCardExportMenu: {
    id: 'course-authoring.taxonomy-list.menu.export.label',
    defaultMessage: 'Export',
  },
  taxonomyMenuAlt: {
    id: 'course-authoring.taxonomy-list.menu.alt',
    defaultMessage: '{name} menu',
  },
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
