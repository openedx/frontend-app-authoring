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
});

export default messages;
