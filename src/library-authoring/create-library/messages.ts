import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  createLibrary: {
    id: 'course-authoring.library-authoring.create-library',
    defaultMessage: 'Create new library',
    description: 'Header for the create library form',
  },
  titleLabel: {
    id: 'course-authoring.library-authoring.create-library.form.title.label',
    defaultMessage: 'Library name',
    description: 'Label for the title field.',
  },
  titlePlaceholder: {
    id: 'course-authoring.library-authoring.create-library.form.title.placeholder',
    defaultMessage: 'e.g. Computer Science Problems',
    description: 'Placeholder text for the title field.',
  },
  titleHelp: {
    id: 'course-authoring.library-authoring.create-library.form.title.help',
    defaultMessage: 'The name for your library',
    description: 'Help text for the title field.',
  },
  orgLabel: {
    id: 'course-authoring.library-authoring.create-library.form.org.label',
    defaultMessage: 'Organization',
    description: 'Label for the organization field.',
  },
  orgPlaceholder: {
    id: 'course-authoring.library-authoring.create-library.form.org.placeholder',
    defaultMessage: 'e.g. UniversityX or OrganizationX',
    description: 'Placeholder text for the organization field.',
  },
  orgHelp: {
    id: 'course-authoring.library-authoring.create-library.form.org.help',
    defaultMessage: 'The public organization name for your library. This cannot be changed.',
    description: 'Help text for the organization field.',
  },
  slugLabel: {
    id: 'course-authoring.library-authoring.create-library.form.slug.label',
    defaultMessage: 'Library ID',
    description: 'Label for the slug field.',
  },
  slugPlaceholder: {
    id: 'course-authoring.library-authoring.create-library.form.slug.placeholder',
    defaultMessage: 'e.g. CSPROB',
    description: 'Placeholder text for the slug field.',
  },
  slugHelp: {
    id: 'course-authoring.library-authoring.create-library.form.slug.help',
    defaultMessage: `The unique code that identifies this library. Note: This is 
    part of your library URL, so no spaces or special characters are allowed. 
    This cannot be changed.`,
    description: 'Help text for the slug field.',
  },
  invalidSlugError: {
    id: 'course-authoring.library-authoring.create-library.form.invalid-slug.error',
    defaultMessage: 'Enter a valid “slug” consisting of Unicode letters, numbers, underscores, or hyphens.',
    description: 'Text to display when slug id has invalid symbols.',
  },
  requiredFieldError: {
    id: 'course-authoring.library-authoring.create-library.form.required.error',
    defaultMessage: 'Required field.',
    description: 'Error message to display when a required field is missing.',
  },
  disallowedCharsError: {
    id: 'course-authoring.library-authoring.create-library.form.disallowed-chars.error',
    defaultMessage: 'Please do not use any spaces or special characters in this field.',
    description: 'Error message to display when a field contains disallowed characters.',
  },
  noSpaceError: {
    id: 'course-authoring.library-authoring.create-library.form.no-space.error',
    defaultMessage: 'Please do not use any spaces in this field.',
    description: 'Error message to display when a field contains spaces.',
  },
  createLibraryButton: {
    id: 'course-authoring.library-authoring.create-library.form.create-library.button',
    defaultMessage: 'Create',
    description: 'Button text for creating a new library.',
  },
  createLibraryButtonPending: {
    id: 'course-authoring.library-authoring.create-library.form.create-library.button.pending',
    defaultMessage: 'Creating..',
    description: 'Button text while the library is being created.',
  },
  cancelCreateLibraryButton: {
    id: 'course-authoring.library-authoring.create-library.form.create-library.cancel.button',
    defaultMessage: 'Cancel',
    description: 'Button text to cancel creating a new library.',
  },
  createFromArchiveButton: {
    id: 'course-authoring.library-authoring.create-library.form.create-from-archive.button',
    defaultMessage: 'Create from archive',
    description: 'Button text to create library from archive.',
  },
  uploadSuccess: {
    id: 'course-authoring.library-authoring.create-library.form.upload.success',
    defaultMessage: 'File uploaded successfully',
    description: 'Success message when file is uploaded.',
  },
  restoreInProgress: {
    id: 'course-authoring.library-authoring.create-library.form.restore.in-progress',
    defaultMessage: 'Restoring library...',
    description: 'Message shown while library is being restored.',
  },
  restoreError: {
    id: 'course-authoring.library-authoring.create-library.form.restore.error',
    defaultMessage: 'Library restore failed. See error log for details.',
    description: 'Error message when library restore fails.',
  },
  createLibraryFromArchiveButton: {
    id: 'course-authoring.library-authoring.create-library.form.create-from-archive-final.button',
    defaultMessage: 'Create Library from Archive',
    description: 'Button text to finalize library creation from archive.',
  },
  createLibraryFromArchiveButtonPending: {
    id: 'course-authoring.library-authoring.create-library.form.create-from-archive-final.button.pending',
    defaultMessage: 'Creating from Archive...',
    description: 'Button text while the library is being created from archive.',
  },
  archiveComponentsCount: {
    id: 'course-authoring.library-authoring.create-library.form.archive.components-count',
    defaultMessage: 'Contains {count} Components',
    description: 'Text showing the number of components in the restored archive.',
  },
  archiveBackupDate: {
    id: 'course-authoring.library-authoring.create-library.form.archive.backup-date',
    defaultMessage: 'Backed up {date} at {time}',
    description: 'Text showing when the archive was backed up.',
  },
  uploadingStatus: {
    id: 'course-authoring.library-authoring.create-library.form.uploading.status',
    defaultMessage: 'Uploading...',
    description: 'Status message shown while file is uploading.',
  },
  invalidFileTypeError: {
    id: 'course-authoring.library-authoring.create-library.form.invalid-file-type.error',
    defaultMessage: 'Invalid file type. Please upload a .zip, .tar.gz, or .tar file.',
    description: 'Error message when user uploads an unsupported file type.',
  },
  viewErrorLogText: {
    id: 'course-authoring.library-authoring.create-library.form.view-error-log.text',
    defaultMessage: 'View error log',
    description: 'Link text to view the error log when restore fails.',
  },
  genericErrorMessage: {
    id: 'course-authoring.library-authoring.create-library.form.generic-error.message',
    defaultMessage: 'An error occurred',
    description: 'Generic error message when a specific error is not available.',
  },
});

export default messages;
