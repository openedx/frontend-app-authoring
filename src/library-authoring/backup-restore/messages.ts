import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  backupPageTitle: {
    id: 'course-authoring.library-authoring.backup-page.title',
    defaultMessage: 'Library Backup',
    description: 'Title for the library backup page',
  },
  backupPageSubtitle: {
    id: 'course-authoring.library-authoring.backup-page.subtitle',
    defaultMessage: 'Tools',
    description: 'Subtitle for the library backup page',
  },
  backupFailedError: {
    id: 'course-authoring.library-authoring.backup-page.error.backup-failed',
    defaultMessage: 'There was an error creating the backup. Please try again later.',
    description: 'Error message when backup creation fails',
  },
  mutationError: {
    id: 'course-authoring.library-authoring.backup-page.error.mutation-failed',
    defaultMessage: 'Failed to start backup: {error}',
    description: 'Error message when backup mutation fails',
  },
  backupPending: {
    id: 'course-authoring.library-authoring.backup-page.status.pending',
    defaultMessage: 'Preparing to download...',
    description: 'Message shown when backup is in pending state',
  },
  backupExporting: {
    id: 'course-authoring.library-authoring.backup-page.status.exporting',
    defaultMessage: 'Your backup is being exported...',
    description: 'Message shown when backup is being exported',
  },
  backupDescription: {
    id: 'course-authoring.library-authoring.backup-page.description',
    defaultMessage: 'Local backups are stored on your machine and are not automatically synced. They will not contain any edit history. You can restore a local backup as a new library on this or another learning site. Anyone who can access the local backup file can view all its content.',
    description: 'Description of what library backups are and how they work',
  },
  createBackupButton: {
    id: 'course-authoring.library-authoring.backup-page.button.create',
    defaultMessage: 'Download Library Backup',
    description: 'Button text to create and download a new backup',
  },
  downloadReadyButton: {
    id: 'course-authoring.library-authoring.backup-page.button.download-ready',
    defaultMessage: 'Download Library Backup',
    description: 'Button text when backup is ready for download',
  },
  creatingBackupButton: {
    id: 'course-authoring.library-authoring.backup-page.button.creating',
    defaultMessage: 'Creating Backup...',
    description: 'Button text when backup is being created',
  },
  exportingBackupButton: {
    id: 'course-authoring.library-authoring.backup-page.button.exporting',
    defaultMessage: 'Exporting...',
    description: 'Button text when backup is being exported',
  },
  downloadAriaLabel: {
    id: 'course-authoring.library-authoring.backup-page.button.aria-label',
    defaultMessage: '{buttonText} for {libraryTitle}',
    description: 'Aria label for the download button',
  },
});

export default messages;
