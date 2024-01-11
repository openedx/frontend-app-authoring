import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.configure-modal.title',
    defaultMessage: '{title} Settings',
  },
  basicTabTitle: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.title',
    defaultMessage: 'Basic',
  },
  releaseDateAndTime: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.release-date-and-time',
    defaultMessage: 'Release Date and Time',
  },
  releaseDate: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.release-date',
    defaultMessage: 'Release Date:',
  },
  releaseTimeUTC: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.release-time-UTC',
    defaultMessage: 'Release Time in UTC:',
  },
  visibilityTabTitle: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.title',
    defaultMessage: 'Visibility',
  },
  visibilitySectionTitle: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.section-visibility',
    defaultMessage: '{visibilityTitle} Visibility',
  },
  unitVisibility: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.unit-visibility',
    defaultMessage: 'Unit Visibility',
  },
  hideFromLearners: {
    id: 'course-authoring.course-outline.configure-modal.visibility.hide-from-learners',
    defaultMessage: 'Hide from learners',
  },
  restrictAccessTo: {
    id: 'course-authoring.course-outline.configure-modal.visibility.restrict-access-to',
    defaultMessage: 'Restrict access to',
  },
  sectionVisibilityWarning: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.section-visibility-warning',
    defaultMessage: 'If you make this section visible to learners, learners will be able to see its content after the release date has passed and you have published the unit. Only units that are explicitly hidden from learners will remain hidden after you clear this option for the section.',
  },
  unitVisibilityWarning: {
    id: 'course-authoring.course-outline.configure-modal.unit-tab.unit-visibility-warning',
    defaultMessage: 'If the unit was previously published and released to learners, any changes you made to the unit when it was hidden will now be visible to learners.',
  },
  unitSelectGroup: {
    id: 'course-authoring.course-outline.configure-modal.unit-tab.unit-select-group',
    defaultMessage: 'Select one or more groups:',
  },
  unitSelectGroupType: {
    id: 'course-authoring.course-outline.configure-modal.unit-tab.unit-select-group-type',
    defaultMessage: 'Select a group type',
  },
  unitAllLearnersAndStaff: {
    id: 'course-authoring.course-outline.configure-modal.unit-tab.unit-all-learners-staff',
    defaultMessage: 'All Learners and Staff',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.configure-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  saveButton: {
    id: 'course-authoring.course-outline.configure-modal.button.label',
    defaultMessage: 'Save',
  },
  grading: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.grading',
    defaultMessage: 'Grading',
  },
  gradeAs: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.grade-as',
    defaultMessage: 'Grade as:',
  },
  dueDate: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.due-date',
    defaultMessage: 'Due Date:',
  },
  dueTimeUTC: {
    id: 'course-authoring.course-outline.configure-modal.basic-tab.due-time-UTC',
    defaultMessage: 'Due Time in UTC:',
  },
  subsectionVisibility: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.subsection-visibility',
    defaultMessage: 'Subsection Visibility',
  },
  showEntireSubsection: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.show-entire-subsection',
    defaultMessage: 'Show entire subsection',
  },
  showEntireSubsectionDescription: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.show-entire-subsection-description',
    defaultMessage: 'Learners see the published subsection and can access its content',
  },
  hideContentAfterDue: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.hide-content-after-due',
    defaultMessage: 'Hide content after due date',
  },
  hideContentAfterDueDescription: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.hide-content-after-due-description',
    defaultMessage: 'After the subsection\'s due date has passed, learners can no longer access its content. The subsection is not included in grade calculations.',
  },
  hideEntireSubsection: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.hide-entire-subsection',
    defaultMessage: 'Hide entire subsection',
  },
  hideEntireSubsectionDescription: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.hide-entire-subsection-description',
    defaultMessage: 'Learners do not see the subsection in the course outline. The subsection is not included in grade calculations.',
  },
  assessmentResultsVisibility: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.assessment-results-visibility',
    defaultMessage: 'Assessment Results Visibility',
  },
  alwaysShowAssessmentResults: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.always-show-assessment-results',
    defaultMessage: 'Always show assessment results',
  },
  alwaysShowAssessmentResultsDescription: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.always-show-assessment-results-description',
    defaultMessage: 'When learners submit an answer to an assessment, they immediately see whether the answer is correct or incorrect, and the score received.',
  },
  neverShowAssessmentResults: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.never-show-assessment-results',
    defaultMessage: 'Never show assessment results',
  },
  neverShowAssessmentResultsDescription: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.never-show-assessment-results-description',
    defaultMessage: 'Learners never see whether their answers to assessments are correct or incorrect, nor the score received.',
  },
  showAssessmentResultsPastDue: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.show-assessment-results-past-due',
    defaultMessage: 'Show assessment results when subsection is past due',
  },
  showAssessmentResultsPastDueDescription: {
    id: 'course-authoring.course-outline.configure-modal.visibility-tab.show-assessment-results-past-due-description',
    defaultMessage: 'Learners do not see whether their answer to assessments were correct or incorrect, nor the score received, until after the due date for the subsection has passed. If the subsection does not have a due date, learners always see their scores when they submit answers to assessments.',
  },
  setSpecialExam: {
    id: 'course-authoring.course-outline.configure-modal.advanced-tab.set-special-exam',
    defaultMessage: 'Set as a Special Exam',
  },
  none: {
    id: 'course-authoring.course-outline.configure-modal.advanced-tab.none',
    defaultMessage: 'None',
  },
  timed: {
    id: 'course-authoring.course-outline.configure-modal.advanced-tab.timed',
    defaultMessage: 'Timed',
  },
  timedDescription: {
    id: 'course-authoring.course-outline.configure-modal.advanced-tab.timed-description',
    defaultMessage: 'Use a timed exam to limit the time learners can spend on problems in this subsection. Learners must submit answers before the time expires. You can allow additional time for individual learners through the instructor Dashboard.',
  },
  advancedTabTitle: {
    id: 'course-authoring.course-outline.configure-modal.advanced-tab.title',
    defaultMessage: 'Advanced',
  },
  timeAllotted: {
    id: 'course-authoring.course-outline.configure-modal.advanced-tab.time-allotted',
    defaultMessage: 'Time Allotted (HH:MM):',
  },
  timeLimitDescription: {
    id: 'course-authoring.course-outline.configure-modal.advanced-tab.time-limit-description',
    defaultMessage: 'Select a time allotment for the exam. If it is over 24 hours, type in the amount of time. You can grant individual learners extra time to complete the exam through the Instructor Dashboard.',
  },
});

export default messages;
