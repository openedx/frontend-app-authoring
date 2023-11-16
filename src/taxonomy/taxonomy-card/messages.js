import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  systemTaxonomyPopoverTitle: {
    id: 'course-authoring.taxonomy-list.popover.system-defined.title',
    defaultMessage: 'System taxonomy',
  },
  systemTaxonomyPopoverBody: {
    id: 'course-authoring.taxonomy-list.popover.system-defined.body',
    defaultMessage: 'This is a system-level taxonomy and is enabled by default.',
  },
  systemDefinedBadge: {
    id: 'course-authoring.taxonomy-list.badge.system-defined.label',
    defaultMessage: 'System-level',
  },
  assignedToOrgsLabel: {
    id: 'course-authoring.taxonomy-list.orgs-count.label',
    defaultMessage: 'Assigned to {orgsCount} orgs',
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
