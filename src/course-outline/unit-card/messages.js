import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingComponents: {
    id: 'course-authoring.course-outline.unit.loading-components',
    defaultMessage: 'Loading components...',
    description: 'Message shown while unit components are being loaded',
  },
  noComponents: {
    id: 'course-authoring.course-outline.unit.no-components',
    defaultMessage: 'No components - Click to open unit editor',
    description: 'Message shown when a unit has no components',
  },
  componentsLoadError: {
    id: 'course-authoring.course-outline.unit.components-load-error',
    defaultMessage: 'Unable to load unit components. Please try again.',
    description: 'Message shown when the unit components request fails',
  },
  editComponent: {
    id: 'course-authoring.course-outline.unit.edit-component',
    defaultMessage: 'Edit component',
    description: 'Label for the button to edit a component',
  },
  legacyEditModalTitle: {
    id: 'course-authoring.course-outline.unit.legacy-edit-modal-title',
    defaultMessage: 'Edit component',
    description: 'Title for the legacy component edit modal',
  },
  componentReorderError: {
    id: 'course-authoring.course-outline.unit.component-reorder-error',
    defaultMessage: 'Failed to save component order',
    description: 'Error message shown when component reordering fails',
  },
  componentSaveError: {
    id: 'course-authoring.course-outline.unit.component-save-error',
    defaultMessage: 'Failed to save component',
    description: 'Error message shown when component save fails',
  },
  addComponentButton: {
    id: 'course-authoring.course-outline.unit.add-component-button',
    defaultMessage: 'Add component',
    description: 'Label for the button to add a new component to a unit from the outline',
  },
  addComponentError: {
    id: 'course-authoring.course-outline.unit.add-component-error',
    defaultMessage: 'Failed to add component. Please try again.',
    description: 'Error message shown when adding a component from the outline fails',
  },
  pasteComponent: {
    id: 'course-authoring.course-outline.unit.paste-component',
    defaultMessage: 'Paste component',
    description: 'Label for the paste component option in the add component dropdown',
  },
  supportPartiallySupported: {
    id: 'course-authoring.course-outline.unit.support-partially-supported',
    defaultMessage: 'Partially supported',
    description: 'Label shown next to advanced components that are partially supported',
  },
  supportNotSupported: {
    id: 'course-authoring.course-outline.unit.support-not-supported',
    defaultMessage: 'Not supported',
    description: 'Label shown next to advanced components that are not supported',
  },
  templateModalTitle: {
    id: 'course-authoring.course-outline.unit.template-modal-title',
    defaultMessage: 'Add {componentTitle} component',
    description: 'Title for the modal that lets the user pick a specific template when a component type has multiple sub-types',
  },
  templateModalCancel: {
    id: 'course-authoring.course-outline.unit.template-modal-cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button in the template selection modal',
  },
  templateModalSelect: {
    id: 'course-authoring.course-outline.unit.template-modal-select',
    defaultMessage: 'Select',
    description: 'Submit button in the template selection modal',
  },
  componentMenuAlt: {
    id: 'course-authoring.course-outline.unit.component-menu-alt',
    defaultMessage: 'Component actions menu',
    description: 'Alt/title text for the component menu button on the course outline',
  },
  menuManageAccess: {
    id: 'course-authoring.course-outline.unit.component-menu-manage-access',
    defaultMessage: 'Manage Access',
    description: 'Menu item for managing component access from the course outline',
  },
  componentDuplicateError: {
    id: 'course-authoring.course-outline.unit.component-duplicate-error',
    defaultMessage: 'Failed to duplicate component. Please try again.',
    description: 'Error message shown when duplicating a component from the outline fails',
  },
  componentDeleteError: {
    id: 'course-authoring.course-outline.unit.component-delete-error',
    defaultMessage: 'Failed to delete component. Please try again.',
    description: 'Error message shown when deleting a component from the outline fails',
  },
  componentRenameError: {
    id: 'course-authoring.course-outline.unit.component-rename-error',
    defaultMessage: 'Failed to rename component. Please try again.',
    description: 'Error message shown when renaming a component from the outline fails',
  },
  editButton: {
    id: 'course-authoring.course-outline.unit.edit-button',
    defaultMessage: 'Edit',
    description: 'Label for the button to edit a component',
  },
});

export default messages;
