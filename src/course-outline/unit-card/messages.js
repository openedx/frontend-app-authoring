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
});

export default messages;
