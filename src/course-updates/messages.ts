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
  loadingUpdatesErrorTitle: {
    id: 'course-authoring.course-updates.error.loading-updates.title',
    defaultMessage: 'Failed to load course updates',
    description: 'Alert title for loading updates error alert',
  },
  loadingUpdatesErrorDescription: {
    id: 'course-authoring.course-updates.error.loading-updates.description',
    defaultMessage: 'Failed to load course updates for {courseId}. Please try again later.',
    description: 'Alert body message for loading course update errors',
  },
  loadingHandoutsErrorTitle: {
    id: 'course-authoring.course-updates.error.loading-handouts.title',
    defaultMessage: 'Failed to load course handouts',
    description: 'Alert title for loading handouts error alert',
  },
  loadingHandoutsErrorDescription: {
    id: 'course-authoring.course-updates.error.loading-handouts.description',
    defaultMessage: 'Failed to load course updates for {courseId}. Please try again later.',
    description: 'Alert body message for loading course handout errors',
  },
  savingUpdatesErrorTitle: {
    id: 'course-authoring.course-updates.error.saving-updates.title',
    defaultMessage: 'Failed to save course update',
    description: 'Alert title for saving updates error alert',
  },
  savingUpdatesErrorDescription: {
    id: 'course-authoring.course-updates.error.saving-updates.description',
    defaultMessage: 'Failed to save recent changes to course update. Please try again later.',
    description: 'Alert body message for saving edits to course update errors',
  },
  savingNewUpdateErrorAlertDescription: {
    id: 'course-authoring.course-updates.error.saving-new-updates.description',
    defaultMessage: 'Failed to save new course update. Please try again later.',
    description: 'Alert body message for saving new course update errors',
  },
  savingHandoutsErrorTitle: {
    id: 'course-authoring.course-updates.error.saving-handouts.title',
    defaultMessage: 'Failed to save course handouts',
    description: 'Alert title for saving handouts error alert',
  },
  savingHandoutsErrorDescription: {
    id: 'course-authoring.course-updates.error.saving-handouts.description',
    defaultMessage: 'Failed to save recent changes to course handouts. Please try again later.',
    description: 'Alert body message for saving course handout errors',
  },
  deletingUpdatesErrorTitle: {
    id: 'course-authoring.course-updates.error.deleting-updates.title',
    defaultMessage: 'Failed to delete course update',
    description: 'Alert title for deleting update error alert',
  },
  deletingUpdatesErrorDescription: {
    id: 'course-authoring.course-updates.error.deleting-updates.description',
    defaultMessage: 'Failed to delete selected course update. Please try again later.',
    description: 'Alert body message for deleting course update errors',
  },
});

export default messages;
