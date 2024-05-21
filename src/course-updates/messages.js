import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.course-updates.header.title',
    defaultMessage: 'Course updates',
    description: 'Title for page',
  },
  headingSubtitle: {
    id: 'course-authoring.course-updates.header.subtitle',
    defaultMessage: 'Content',
    description: 'Subtitle for page',
  },
  sectionInfo: {
    id: 'course-authoring.course-updates.section-info',
    defaultMessage: 'Use course updates to notify students of important dates or exams, highlight particular discussions in the forums, announce schedule changes, and respond to student questions.',
    description: 'Message describing the use of course updates in a course',
  },
  newUpdateButton: {
    id: 'course-authoring.course-updates.actions.new-update',
    defaultMessage: 'New update',
    description: 'Button label for header button to add a new course update',
  },
  firstUpdateButton: {
    id: 'course-authoring.course-updates.actions.first-update',
    defaultMessage: 'Add first update',
    description: 'Button label for button to add first course update',
  },
  noCourseUpdates: {
    id: 'course-authoring.course-updates.actions.first-update-message',
    defaultMessage: 'You have not added any updates to this course yet.',
    description: 'Message to notify user that they do not have any existing course updates',
  },
  loadingErrorAlertTitle: {
    id: 'course-authoring.course-updates.actions.first-update-message',
    defaultMessage: 'Failed to load course {errorType}',
    description: 'Alert title for loading error alert',
  },
  loadingErrorAlertDescription: {
    id: 'course-authoring.course-updates.loading-error',
    defaultMessage: '{message} Please try again later.',
    description: 'Alert body message for loading course update and handout errors',
  },
  savingErrorAlertTitle: {
    id: 'course-authoring.course-updates.saving-error.title',
    defaultMessage: 'Failed to {actionType} course {errorType}',
    description: 'Alert title for saving error alert',
  },
  savingErrorAlertDescription: {
    id: 'course-authoring.course-updates.saving-error.description',
    defaultMessage: '{message} Please try again later.',
    description: 'Alert body message for saving course update and handout errors',
  },
});

export default messages;
