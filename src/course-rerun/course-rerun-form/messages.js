import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  rerunCourseDescription: {
    id: 'course-authoring.course-rerun.form.description',
    defaultMessage: 'Provide identifying information for this re-run of the course. The original course is not affected in any way by a re-run. {strong}',
  },
  rerunCourseDescriptionStrong: {
    id: 'course-authoring.course-rerun.form.description.strong',
    defaultMessage: 'Note: Together, the organization, course number, and course run must uniquely identify this new course instance.',
  },
});

export default messages;
