import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pacingTitle: {
    id: 'course-authoring.schedule.pacing.title',
    defaultMessage: 'Course pacing',
  },
  pacingDescription: {
    id: 'course-authoring.schedule.pacing.description',
    defaultMessage: 'Set the pacing for this course',
  },
  pacingRestriction: {
    id: 'course-authoring.schedule.pacing.restriction',
    defaultMessage: 'Course pacing cannot be changed once a course has started',
  },
  pacingTypeInstructorLabel: {
    id: 'course-authoring.schedule.pacing.radio.instructor.label',
    defaultMessage: 'Instructor-paced',
  },
  pacingTypeInstructorDescription: {
    id: 'course-authoring.schedule.pacing.radio.instructor.description',
    defaultMessage:
      'Instructor-paced courses progress at the pace that the course author sets. You can configure release dates for course content and due dates for assignments.',
  },
  pacingTypeSelfLabel: {
    id: 'course-authoring.schedule.pacing.radio.self-paced.label',
    defaultMessage: 'Self-paced',
  },
  pacingTypeSelfDescription: {
    id: 'course-authoring.schedule.pacing.radio.self-paced.description',
    defaultMessage: 'Self-paced courses offer suggested due dates for assignments or exams based on the learner’s enrollment date and the expected course duration. These courses offer learners flexibility to modify the assignment dates as needed.',
  },
});

export default messages;
