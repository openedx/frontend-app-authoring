import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  assignmentTypeNameTitle: {
    id: 'course-authoring.grading-settings.assignment.type-name.title',
    defaultMessage: 'Assignment type name',
  },
  assignmentTypeNameDescription: {
    id: 'course-authoring.grading-settings.assignment.type-name.description',
    defaultMessage: 'The general category for this type of assignment, for example, Homework or Midterm Exam. This name is visible to learners.',
  },
  assignmentTypeNameErrorMessage1: {
    id: 'course-authoring.grading-settings.assignment.type-name.error.message-1',
    defaultMessage: 'The assignment type must have a name.',
  },
  assignmentTypeNameErrorMessage2: {
    id: 'course-authoring.grading-settings.assignment.type-name.error.message-2',
    defaultMessage: 'For grading to work, you must change all {initialAssignmentName} subsections to {value}.',
  },
  assignmentTypeNameErrorMessage3: {
    id: 'course-authoring.grading-settings.assignment.type-name.error.message-3',
    defaultMessage: "There's already another assignment type with this name.",
  },
  abbreviationTitle: {
    id: 'course-authoring.grading-settings.assignment.abbreviation.title',
    defaultMessage: 'Abbreviation',
  },
  abbreviationDescription: {
    id: 'course-authoring.grading-settings.assignment.abbreviation.description',
    defaultMessage: "This short name for the assignment type (for example, HW or Midterm) appears next to assignments on a learner's Progress page.",
  },
  weightOfTotalGradeTitle: {
    id: 'course-authoring.grading-settings.assignment.weight-of-total-grade.title',
    defaultMessage: 'Weight of total grade',
  },
  weightOfTotalGradeDescription: {
    id: 'course-authoring.grading-settings.assignment.weight-of-total-grade.description',
    defaultMessage: 'The weight of all assignments of this type as a percentage of the total grade, for example, 40. Do not include the percent symbol.',
  },
  weightOfTotalGradeErrorMessage: {
    id: 'course-authoring.grading-settings.assignment.weight-of-total-grade.error.message',
    defaultMessage: 'Please enter an integer between 0 and 100.',
  },
  totalNumberTitle: {
    id: 'course-authoring.grading-settings.assignment.total-number.title',
    defaultMessage: 'Total number',
  },
  totalNumberDescription: {
    id: 'course-authoring.grading-settings.assignment.total-number.description',
    defaultMessage: 'The number of subsections in the course that contain problems of this assignment type.',
  },
  totalNumberErrorMessage: {
    id: 'course-authoring.grading-settings.assignment.total-number.error.message',
    defaultMessage: 'Please enter an integer greater than 0.',
  },
  numberOfDroppableTitle: {
    id: 'course-authoring.grading-settings.assignment.number-of-droppable.title',
    defaultMessage: 'Number of droppable',
  },
  numberOfDroppableDescription: {
    id: 'course-authoring.grading-settings.assignment.number-of-droppable.description',
    defaultMessage: 'The number of assignments of this type that will be dropped. The lowest scoring assignments are dropped first.',
  },
  numberOfDroppableErrorMessage: {
    id: 'course-authoring.grading-settings.assignment.number-of-droppable.error.message',
    defaultMessage: 'Please enter non-negative integer.',
  },
  numberOfDroppableSecondErrorMessage: {
    id: 'course-authoring.grading-settings.assignment.number-of-droppable.second.error.message',
    defaultMessage: 'Cannot drop more {type} assignments than are assigned.',
  },
  assignmentAlertWarningTitle: {
    id: 'course-authoring.grading-settings.assignment.alert.warning.title',
    defaultMessage: 'Warning: The number of {type} assignments defined here does not match the current number of {type} assignments in the course:',
  },
  assignmentAlertWarningDescription: {
    id: 'course-authoring.grading-settings.assignment.alert.warning.description',
    defaultMessage: 'There are no assignments of this type in the course.',
  },
  assignmentAlertWarningUsageTitle: {
    id: 'course-authoring.grading-settings.assignment.alert.warning.usage.title',
    defaultMessage: 'Warning: The number of {type} assignments defined here does not match the current number of {type} assignments in the course:',
  },
  assignmentAlertWarningSuccess: {
    id: 'course-authoring.grading-settings.assignment.alert.success.title',
    defaultMessage: 'The number of {type} assignments in the course matches the number defined here.',
  },
  assignmentDeleteButton: {
    id: 'course-authoring.grading-settings.assignment.delete.button',
    defaultMessage: 'Delete',
  },
});

export default messages;
