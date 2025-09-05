import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  publishedChipText: {
    id: 'course-authoring.library-authoring.publish-status-buttons.publish-chip.text',
    defaultMessage: 'Published',
    description: 'Text shown when a unit/section/subsection/component is published.',
  },
  publishContainerButton: {
    id: 'course-authoring.library-authoring.publish-status-buttons.publish-draft-button.text',
    defaultMessage: 'Publish Changes {publishStatus}',
    description: 'Button text to initiate publish the unit/subsection/section/component, showing current publish status',
  },
  draftChipText: {
    id: 'course-authoring.library-authoring.publish-status.publish-draft-button.draft-chip.text',
    defaultMessage: 'Draft',
    description: 'Chip in publish draft button',
  },
});

export default messages;
