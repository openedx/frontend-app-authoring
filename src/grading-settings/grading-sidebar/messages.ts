import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  gradingSidebarTitle: {
    id: 'course-authoring.grading-settings.sidebar.about.title',
    defaultMessage: 'What can I do on this page?',
  },
  gradingSidebarAbout1: {
    id: 'course-authoring.grading-settings.sidebar.about.text-1',
    defaultMessage: 'You can use the slider under Overall Grade Range to specify whether your course is pass/fail or graded by letter, and to establish the thresholds for each grade.',
  },
  gradingSidebarAbout2: {
    id: 'course-authoring.grading-settings.sidebar.about.text-2',
    defaultMessage: 'You can specify whether your course offers students a grace period for late assignments.',
  },
  gradingSidebarAbout3: {
    id: 'course-authoring.grading-settings.sidebar.about.text-3',
    defaultMessage: 'You can also create assignment types, such as homework, labs, quizzes, and exams, and specify how much of a student\'s grade each assignment type is worth.',
  },
});

export default messages;
