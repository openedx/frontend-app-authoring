import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  actionsButtonLabel: {
    id: 'course-authoring.taxonomy-menu.action.button.label',
    defaultMessage: 'Actions',
  },
  actionsButtonAlt: {
    id: 'course-authoring.taxonomy-menu.action.button.alt',
    defaultMessage: '{name} actions',
  },
  importMenu: {
    id: 'course-authoring.taxonomy-menu.import.label',
    defaultMessage: 'Re-import',
  },
  manageOrgsMenu: {
    id: 'course-authoring.taxonomy-menu.assign-orgs.label',
    defaultMessage: 'Manage Organizations',
  },
  exportMenu: {
    id: 'course-authoring.taxonomy-menu.export.label',
    defaultMessage: 'Export',
  },
  deleteMenu: {
    id: 'course-authoring.taxonomy-menu.delete.label',
    defaultMessage: 'Delete',
  },
  taxonomyDeleteToast: {
    id: 'course-authoring.taxonomy-list.toast.delete',
    defaultMessage: '"{name}" deleted',
  },
});

export default messages;
