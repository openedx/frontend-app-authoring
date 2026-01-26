import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  unscheduledLabel: {
    id: 'course-authoring.course-outline.xblock-status.unscheduled.label',
    defaultMessage: 'Unscheduled',
  },
  releasedLabel: {
    id: 'course-authoring.course-outline.xblock-status.released.label',
    defaultMessage: 'Released: ',
  },
  scheduledLabel: {
    id: 'course-authoring.course-outline.xblock-status.scheduled.label',
    defaultMessage: 'Scheduled: ',
  },
  onboardingExam: {
    id: 'course-authoring.course-outline.xblock-status.onboardingExam.value',
    defaultMessage: 'Onboarding Exam',
  },
  practiceProctoredExam: {
    id: 'course-authoring.course-outline.xblock-status.practiceProctoredExam.value',
    defaultMessage: 'Practice proctored Exam',
  },
  proctoredExam: {
    id: 'course-authoring.course-outline.xblock-status.proctoredExam.value',
    defaultMessage: 'Proctored Exam',
  },
  timedExam: {
    id: 'course-authoring.course-outline.xblock-status.timedExam.value',
    defaultMessage: 'Timed Exam',
  },
  releaseStatusScreenReaderTitle: {
    id: 'course-authoring.course-outline.xblock-status.releaseStatusScreenReader.title',
    defaultMessage: 'Release Status: ',
  },
  gradedAsScreenReaderLabel: {
    id: 'course-authoring.course-outline.xblock-status.gradedAsScreenReader.label',
    defaultMessage: 'Graded as: ',
  },
  ungradedText: {
    id: 'course-authoring.course-outline.xblock-status.ungraded.text',
    defaultMessage: 'Ungraded',
  },
  dueLabel: {
    id: 'course-authoring.course-outline.xblock-status.due.label',
    defaultMessage: 'Due:',
  },
  customDueDateLabel: {
    id: 'course-authoring.course-outline.xblock-status.custom-due-date.label',
    defaultMessage: 'Custom due date: {relativeWeeksDue, plural, one {# week} other {# weeks}} from enrollment',
  },
  prerequisiteLabel: {
    id: 'course-authoring.course-outline.xblock-status.prerequisite.label',
    defaultMessage: 'Prerequisite: {prereqDisplayName}',
  },
  restrictedUnitAccess: {
    id: 'course-authoring.course-outline.xblock-status.restrictedUnitAccess.text',
    defaultMessage: 'Access to this unit is restricted to: {selectedGroupsLabel}',
  },
  restrictedUnitAccessToSomeContent: {
    id: 'course-authoring.course-outline.xblock-status.restrictedUnitAccessToSomeContent.text',
    defaultMessage: 'Access to some content in this unit is restricted to specific groups of learners',
  },
  gradingPolicyMismatchText: {
    id: 'course-authoring.course-outline.xblock-status.gradingPolicyMismatch.text',
    defaultMessage: 'This subsection is configured as "{gradingType}", which doesn\'t exist in the current grading policy.',
  },
  hiddenAfterEndDate: {
    id: 'course-authoring.course-outline.xblock-status.hiddenAfterEndDate.text',
    defaultMessage: 'Subsection is hidden after course end date',
  },
  hiddenAfterDueDate: {
    id: 'course-authoring.course-outline.xblock-status.hiddenAfterDueDate.text',
    defaultMessage: 'Subsection is hidden after due date',
  },
});

export default messages;
