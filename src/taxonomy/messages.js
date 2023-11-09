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
  downloadTemplateButtonCSVLabel: {
    id: 'course-authoring.taxonomy-list.button.download-template.csv.label',
    defaultMessage: 'CSV template',
  },
  downloadTemplateButtonJSONLabel: {
    id: 'course-authoring.taxonomy-list.button.download-template.json.label',
    defaultMessage: 'JSON template',
  },
  downloadTemplateButtonHint: {
    id: 'course-authoring.taxonomy-list.butotn.download-template.hint',
    defaultMessage: 'Download example taxonomy',
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
});

export default messages;
