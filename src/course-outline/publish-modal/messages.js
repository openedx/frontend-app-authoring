import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.publish-modal.title',
    defaultMessage: 'Publish {title}',
  },
  description: {
    id: 'course-authoring.course-outline.publish-modal.description',
    defaultMessage: 'Publish all unpublished changes for this {category}?',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.publish-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  publishButton: {
    id: 'course-authoring.course-outline.publish-modal.button.label',
    defaultMessage: 'Publish',
  },
});

export default messages;
