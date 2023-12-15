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
});

export default messages;
