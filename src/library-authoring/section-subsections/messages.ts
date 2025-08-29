import { defineMessages } from '@edx/frontend-platform/i18n';

export const messages = defineMessages({
  breadcrumbsAriaLabel: {
    id: 'course-authoring.library-authoring.section-page.breadcrumbs.label.text',
    defaultMessage: 'Navigation breadcrumbs',
    description: 'Aria label for navigation breadcrumbs',
  },
  orderUpdatedMsg: {
    id: 'course-authoring.library-authoring.container-component.order-updated-msg.text',
    defaultMessage: 'Order updated',
    description: 'Toast message displayed when children items are successfully reordered in a container',
  },
  failedOrderUpdatedMsg: {
    id: 'course-authoring.library-authoring.container-component.failed-order-updated-msg.text',
    defaultMessage: 'Failed to update children order',
    description: 'Toast message displayed when reordering of children items in container fails',
  },
  draftChipText: {
    id: 'course-authoring.library-authoring.container-component.draft-chip.text',
    defaultMessage: 'Draft',
    description: 'Chip in children in section and subsection page that is shown when children has unpublished changes',
  },
});

export const sectionMessages = defineMessages({
  infoButtonText: {
    id: 'course-authoring.library-authoring.section-header.buttons.info',
    defaultMessage: 'Section Info',
    description: 'Button text to section sidebar from section page',
  },
  addContentButton: {
    id: 'course-authoring.library-authoring.section-header.buttons.add-subsection',
    defaultMessage: 'Add New Subsection',
    description: 'Text of button to add subsection to section',
  },
  addExistingContentButton: {
    id: 'course-authoring.library-authoring.section-header.buttons.add-existing-subsection',
    defaultMessage: 'Add Existing Subsection',
    description: 'Text of button to add existing content to section',
  },
  newContentButton: {
    id: 'course-authoring.library-authoring.section-header.buttons.add-new-subsection',
    defaultMessage: 'Add Subsection',
    description: 'Text of button to add new subsection to section in header',
  },
  noChildrenText: {
    id: 'course-authoring.library-authoring.section.no-children.text',
    defaultMessage: 'This section is empty',
    description: 'Message to display when section has not children',
  },
});

export const subsectionMessages = defineMessages({
  infoButtonText: {
    id: 'course-authoring.library-authoring.subsection-header.buttons.info',
    defaultMessage: 'Subsection Info',
    description: 'Button text to subsection sidebar from subsection page',
  },
  addContentButton: {
    id: 'course-authoring.library-authoring.subsection-header.buttons.add-subsection',
    defaultMessage: 'Add New Unit',
    description: 'Text of button to add subsection to subsection',
  },
  addExistingContentButton: {
    id: 'course-authoring.library-authoring.subsection-header.buttons.add-existing-subsection',
    defaultMessage: 'Add Existing Unit',
    description: 'Text of button to add existing content to subsection',
  },
  newContentButton: {
    id: 'course-authoring.library-authoring.subsection-header.buttons.add-new-subsection',
    defaultMessage: 'Add Unit',
    description: 'Text of button to add new subsection to subsection in header',
  },
  noChildrenText: {
    id: 'course-authoring.library-authoring.subsection.no-children.text',
    defaultMessage: 'This subsection is empty',
    description: 'Message to display when subsection has not children',
  },
});
