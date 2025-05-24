import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
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
  breadcrumbsAriaLabel: {
    id: 'course-authoring.library-authoring.breadcrumbs.label.text',
    defaultMessage: 'Navigation breadcrumbs',
    description: 'Aria label for navigation breadcrumbs',
  },
  draftChipText: {
    id: 'course-authoring.library-authoring.section-component.draft-chip.text',
    defaultMessage: 'Draft',
    description: 'Chip in components in section page that is shown when component has unpublished changes',
  },
  sectionNoChildrenText: {
    id: 'course-authoring.library-authoring.section.no-children.text',
    defaultMessage: 'This section is empty',
    description: 'Message to display when section has not children',
  },
});

export default messages;
