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
});

export default messages;
