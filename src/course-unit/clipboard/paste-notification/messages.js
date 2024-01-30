import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  hasConflictingErrorsTitle: {
    id: 'course-authoring.course-unit.paste-notification.has-conflicting-errors.title',
    defaultMessage: 'Files need to be updated manually.',
  },
  hasConflictingErrorsDescription: {
    id: 'course-authoring.course-unit.paste-notification.has-conflicting-errors.description',
    defaultMessage: 'The following files must be updated manually for components to work as intended:',
  },
  hasConflictingErrorsButtonText: {
    id: 'course-authoring.course-unit.paste-notification.has-conflicting-errors.button.text',
    defaultMessage: 'Upload files',
  },
  hasErrorsTitle: {
    id: 'course-authoring.course-unit.paste-notification.has-errors.title',
    defaultMessage: 'Some errors occurred',
  },
  hasErrorsDescription: {
    id: 'course-authoring.course-unit.paste-notification.has-errors.description',
    defaultMessage: 'The following required files could not be added to the course:',
  },
  hasNewFilesTitle: {
    id: 'course-authoring.course-unit.paste-notification.has-new-files.title',
    defaultMessage: 'New file(s) added to Files & Uploads.',
  },
  hasNewFilesDescription: {
    id: 'course-authoring.course-unit.paste-notification.has-new-files.description',
    defaultMessage: 'The following required files were imported to this course:',
  },
  hasNewFilesButtonText: {
    id: 'course-authoring.course-unit.paste-notification.has-new-files.button.text',
    defaultMessage: 'View files',
  },
});

export default messages;
