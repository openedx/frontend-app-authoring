import { defineMessages } from '@edx/frontend-platform/i18n';
import { MAX_TOTAL_LENGTH } from '../../data/constants';

const messages = defineMessages({
  courseDisplayNameLabel: {
    id: 'course-authoring.create-or-rerun-course.display-name.label',
    defaultMessage: 'Course name',
  },
  courseDisplayNamePlaceholder: {
    id: 'course-authoring.create-or-rerun-course.display-name.placeholder',
    defaultMessage: 'e.g. Introduction to Computer Science',
  },
  courseDisplayNameCreateHelpText: {
    id: 'course-authoring.create-or-rerun-course.create.display-name.help-text',
    defaultMessage: 'The public display name for your course. This cannot be changed, but you can set a different display name in advanced settings later.',
  },
  courseDisplayNameRerunHelpText: {
    id: 'course-authoring.create-or-rerun-course.rerun.display-name.help-text',
    defaultMessage: 'The public display name for the new course. (This name is often the same as the original course name.)',
  },
  courseOrgLabel: {
    id: 'course-authoring.create-or-rerun-course.org.label',
    defaultMessage: 'Organization',
  },
  courseOrgPlaceholder: {
    id: 'course-authoring.create-or-rerun-course.org.placeholder',
    defaultMessage: 'e.g. UniversityX or OrganizationX',
  },
  courseOrgNoOptions: {
    id: 'course-authoring.create-or-rerun-course.org.no-options',
    defaultMessage: 'No options',
  },
  courseOrgCreateHelpText: {
    id: 'course-authoring.create-or-rerun-course.create.org.help-text',
    defaultMessage: 'The name of the organization sponsoring the course. {strong} This cannot be changed, but you can set a different display name in advanced settings later.',
  },
  courseOrgRerunHelpText: {
    id: 'course-authoring.create-or-rerun-course.rerun.org.help-text',
    defaultMessage: 'The name of the organization sponsoring the new course. (This name is often the same as the original organization name.) {strong}',
  },
  courseNoteNoSpaceAllowedStrong: {
    id: 'course-authoring.create-or-rerun-course.no-space-allowed.strong',
    defaultMessage: 'Note: No spaces or special characters are allowed.',
  },
  courseNoteOrgNameIsPartStrong: {
    id: 'course-authoring.create-or-rerun-course.org.help-text.strong',
    defaultMessage: 'Note: The organization name is part of the course URL.',
  },
  courseNumberLabel: {
    id: 'course-authoring.create-or-rerun-course.number.label',
    defaultMessage: 'Course number',
  },
  courseNumberPlaceholder: {
    id: 'course-authoring.create-or-rerun-course.number.placeholder',
    defaultMessage: 'e.g. CS101',
  },
  courseNumberCreateHelpText: {
    id: 'course-authoring.create-or-rerun-course.create.number.help-text',
    defaultMessage: 'The unique number that identifies your course within your organization. {strong}',
  },
  courseNumberRerunHelpText: {
    id: 'course-authoring.create-or-rerun-course.rerun.number.help-text',
    defaultMessage: 'The unique number that identifies the new course within the organization. (This number will be the same as the original course number and cannot be changed.)',
  },
  courseNotePartCourseURLRequireStrong: {
    id: 'course-authoring.create-or-rerun-course.number.help-text.strong',
    defaultMessage: 'Note: This is part of your course URL, so no spaces or special characters are allowed and it cannot be changed.',
  },
  courseRunLabel: {
    id: 'course-authoring.create-or-rerun-course.run.label',
    defaultMessage: 'Course run',
  },
  courseRunPlaceholder: {
    id: 'course-authoring.create-or-rerun-course.run.placeholder',
    defaultMessage: 'e.g. 2014_T1',
  },
  courseRunCreateHelpText: {
    id: 'course-authoring.create-or-rerun-course.create.run.help-text',
    defaultMessage: 'The term in which your course will run. {strong}',
  },
  courseRunRerunHelpText: {
    id: 'course-authoring.create-or-rerun-course.create.rerun.help-text',
    defaultMessage: 'The term in which the new course will run. (This value is often different than the original course run value.){strong}',
  },
  defaultPlaceholder: {
    id: 'course-authoring.create-or-rerun-course.default-placeholder',
    defaultMessage: 'Label',
  },
  createButton: {
    id: 'course-authoring.create-or-rerun-course.create.button.create',
    defaultMessage: 'Create',
  },
  rerunCreateButton: {
    id: 'course-authoring.create-or-rerun-course.rerun.button.create',
    defaultMessage: 'Create re-run',
  },
  creatingButton: {
    id: 'course-authoring.create-or-rerun-course.button.creating',
    defaultMessage: 'Creating',
  },
  rerunningCreateButton: {
    id: 'course-authoring.create-or-rerun-course.rerun.button.rerunning',
    defaultMessage: 'Processing re-run request',
  },
  cancelButton: {
    id: 'course-authoring.create-or-rerun-course.button.cancel',
    defaultMessage: 'Cancel',
  },
  requiredFieldError: {
    id: 'course-authoring.create-or-rerun-course.required.error',
    defaultMessage: 'Required field.',
  },
  disallowedCharsError: {
    id: 'course-authoring.create-or-rerun-course.disallowed-chars.error',
    defaultMessage: 'Please do not use any spaces or special characters in this field.',
  },
  noSpaceError: {
    id: 'course-authoring.create-or-rerun-course.no-space.error',
    defaultMessage: 'Please do not use any spaces in this field.',
  },
  totalLengthError: {
    id: 'course-authoring.create-or-rerun-course.total-length-error.error',
    defaultMessage: `The combined length of the organization, course number and course run fields cannot be more than ${MAX_TOTAL_LENGTH} characters.`,
  },
  alertErrorExistsAriaLabelledBy: {
    id: 'course-authoring.create-or-rerun-course.error.already-exists.labelledBy',
    defaultMessage: 'alert-already-exists-title',
  },
  alertErrorExistsAriaDescribedBy: {
    id: 'course-authoring.create-or-rerun-course.error.already-exists.aria.describedBy',
    defaultMessage: 'alert-confirmation-description',
  },
});

export default messages;
