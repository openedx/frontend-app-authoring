import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  infoButtonText: {
    id: 'course-authoring.library-authoring.unit-header.buttons.info',
    defaultMessage: 'Unit Info',
    description: 'Button text to unit sidebar from unit page',
  },
  addContentButton: {
    id: 'course-authoring.library-authoring.unit-header.buttons.add-content',
    defaultMessage: 'Add Content',
    description: 'Text of button to add content to unit',
  },
  addExistingContentButton: {
    id: 'course-authoring.library-authoring.unit-header.buttons.add-existing-content',
    defaultMessage: 'Add Existing Content',
    description: 'Text of button to add existing content to unit',
  },
  newContentButton: {
    id: 'course-authoring.library-authoring.unit-header.buttons.add-new-content',
    defaultMessage: 'Add New Content',
    description: 'Text of button to add new content to unit',
  },
  breadcrumbsAriaLabel: {
    id: 'course-authoring.library-authoring.breadcrumbs.label.text',
    defaultMessage: 'Navigation breadcrumbs',
    description: 'Aria label for navigation breadcrumbs',
  },
  draftChipText: {
    id: 'course-authoring.library-authoring.unit-component.draft-chip.text',
    defaultMessage: 'Draft',
    description: 'Chip in components in unit page that is shown when component has unpublished changes',
  },
  updateComponentSuccessMsg: {
    id: 'course-authoring.library-authoring.unit-component.update.success',
    defaultMessage: 'Component updated successfully.',
    description: 'Message when the component is updated successfully',
  },
  updateComponentErrorMsg: {
    id: 'course-authoring.library-authoring.unit-component.update.error',
    defaultMessage: 'There was an error updating the component.',
    description: 'Message when there is an error when updating the component',
  },
  updateContainerSuccessMsg: {
    id: 'course-authoring.library-authoring.update-container-success-msg',
    defaultMessage: 'Container updated successfully.',
    description: 'Message displayed when container is updated successfully',
  },
  updateContainerErrorMsg: {
    id: 'course-authoring.library-authoring.update-container-error-msg',
    defaultMessage: 'Failed to update container.',
    description: 'Message displayed when container update fails',
  },
  orderUpdatedMsg: {
    id: 'course-authoring.library-authoring.unit-component.order-updated-msg.text',
    defaultMessage: 'Order updated',
    description: 'Toast message displayed when components are successfully reordered in a unit',
  },
  failedOrderUpdatedMsg: {
    id: 'course-authoring.library-authoring.unit-component.failed-order-updated-msg.text',
    defaultMessage: 'Failed to update components order',
    description: 'Toast message displayed when components are successfully reordered in a unit',
  },
});

export default messages;
