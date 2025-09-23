import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  publishCourseModalTitle: {
    id: 'course-authoring.course-outline.course-sidebar.publish-course-modal.title',
    defaultMessage: 'Publish course confirmation',
  },
  publishCourseModalDescription: {
    id: 'course-authoring.course-outline.course-sidebar.publish-course-modal.description',
    defaultMessage: 'Please review the course information before publishing.',
  },
  publishCourseModalButtonBack: {
    id: 'course-authoring.course-outline.course-sidebar.publish-course-modal.button.back',
    defaultMessage: 'Go back',
  },
  publishCourseModalButtonPublish: {
    id: 'course-authoring.course-outline.course-sidebar.publish-course-modal.button.publish',
    defaultMessage: 'Publish',
  },
  publishCourseModalButtonPublishing: {
    id: 'course-authoring.course-outline.course-sidebar.publish-course-modal.button.publishing',
    defaultMessage: 'Publishing...',
  },
  publishCourseModalSuccessMessage: {
    id: 'course-authoring.course-outline.course-sidebar.publish-course-modal.success.message',
    defaultMessage: 'Course published successfully!',
  },
  publishCourseModalErrorMessage: {
    id: 'course-authoring.course-outline.course-sidebar.publish-course-modal.error.message',
    defaultMessage: 'Failed to publish course. Please try again.',
  },
});

export default messages;
