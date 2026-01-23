import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.status-bar.modal.title',
    defaultMessage: 'Enable course highlight emails',
  },
  description_1: {
    id: 'course-authoring.course-outline.status-bar.modal.description-1',
    defaultMessage: 'When you enable course highlight emails, learners automatically receive email messages for each section that has highlights. You cannot disable highlights after you start sending them.',
  },
  description_2: {
    id: 'course-authoring.course-outline.status-bar.modal.description-2',
    defaultMessage: 'Are you sure you want to enable course highlight emails?',
  },
  link: {
    id: 'course-authoring.course-outline.status-bar.modal.link',
    defaultMessage: 'Learn more',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.status-bar.modal.cancelButton',
    defaultMessage: 'Cancel',
  },
  submitButton: {
    id: 'course-authoring.course-outline.status-bar.modal.submitButton',
    defaultMessage: 'Enable',
  },
});

export default messages;
