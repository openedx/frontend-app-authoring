import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'authoring.create-course-modal.title',
    defaultMessage: 'Generating course content',
    description: 'Title of the Create Course Modal',
  },
  description: {
    id: 'authoring.create-course-modal.description',
    defaultMessage: 'Content generation may take a few minutes. Please wait.',
    description: 'Description of the Create Course Modal',
  },
  goToCourseListButton: {
    id: 'authoring.create-course-modal.go-to-course-list-button',
    defaultMessage: 'Go to course list',
    description: 'Button to go to the course list',
  },
  goToCourseContentButton: {
    id: 'authoring.create-course-modal.go-to-course-content-button',
    defaultMessage: 'Go to course content',
    description: 'Button to go to the course content',
  },
});

export default messages;
