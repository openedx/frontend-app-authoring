import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  hasConflictingErrorsTitle: {
    id: 'course-authoring.course-unit.paste-notification.has-conflicting-errors.title',
    defaultMessage: 'Files need to be updated manually.',
    description: 'Title for a notification indicating that files need manual updates '
      + 'due to a conflict in the clipboard.',
  },
  hasConflictingErrorsDescription: {
    id: 'course-authoring.course-unit.paste-notification.has-conflicting-errors.description',
    defaultMessage: 'The following files must be updated manually for components to work as intended:',
    description: 'Description for the notification indicating which files need manual '
      + 'updates due to a clipboard conflict.',
  },
  hasConflictingErrorsButtonText: {
    id: 'course-authoring.course-unit.paste-notification.has-conflicting-errors.button.text',
    defaultMessage: 'Upload files',
    description: 'Button text prompting users to upload files to resolve a clipboard conflict.',
  },
  hasErrorsTitle: {
    id: 'course-authoring.course-unit.paste-notification.has-errors.title',
    defaultMessage: 'Some errors occurred',
    description: 'Title for a notification indicating that some errors occurred, likely '
      + 'related to file conflicts.',
  },
  hasErrorsDescription: {
    id: 'course-authoring.course-unit.paste-notification.has-errors.description',
    defaultMessage: 'The following required files could not be added to the course:',
    description: 'Description for the notification indicating which required files '
      + 'couldn\'t be added to the course due to errors.',
  },
  hasNewFilesTitle: {
    id: 'course-authoring.course-unit.paste-notification.has-new-files.title',
    defaultMessage: 'New file(s) added to Files & Uploads.',
    description: 'Title for a notification indicating that new files have been added to '
      + 'the Files & Uploads section.',
  },
  hasNewFilesDescription: {
    id: 'course-authoring.course-unit.paste-notification.has-new-files.description',
    defaultMessage: 'The following required files were imported to this course:',
    description: 'Description for the notification indicating which required files '
      + 'were imported to the course.',
  },
  hasNewFilesButtonText: {
    id: 'course-authoring.course-unit.paste-notification.has-new-files.button.text',
    defaultMessage: 'View files',
    description: 'Button text prompting users to view new files imported to the course.',
  },
});

export default messages;
