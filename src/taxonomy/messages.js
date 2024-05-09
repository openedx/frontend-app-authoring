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
  orgAllValue: {
    id: 'course-authoring.taxonomy-list.select.org.all',
    defaultMessage: 'All',
  },
  orgUnassignedValue: {
    id: 'course-authoring.taxonomy-list.select.org.unassigned',
    defaultMessage: 'Unassigned',
  },
  usageLoadingMessage: {
    id: 'course-authoring.taxonomy-list.spinner.loading',
    defaultMessage: 'Loading',
  },
  taxonomyDeleteToast: {
    id: 'course-authoring.taxonomy-list.toast.delete',
    defaultMessage: '"{name}" deleted',
  },
  taxonomyDismissLabel: {
    id: 'course-authoring.taxonomy-list.alert.dismiss',
    defaultMessage: 'Dismiss',
  },
  importInProgressAlertDescription: {
    id: 'course-authoring.import-tags.prompt.in-progress',
    defaultMessage: 'Please keep this window open. We\'ll let you know when it\'s done.',
    description: 'Alert message when the taxonomy import is in progress.',
  },
});

export default messages;
