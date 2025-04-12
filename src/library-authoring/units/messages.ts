import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  infoButtonText: {
    id: 'course-authoring.library-authoring.unit-header.buttons.info',
    defaultMessage: 'Unit Info',
    description: 'Button text to unit sidebar from unit page',
  },
  newContentButton: {
    id: 'course-authoring.library-authoring.unit-header.buttons.new-content',
    defaultMessage: 'Add Content',
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
});

export default messages;
