import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.files-and-uploads.heading',
    defaultMessage: 'Files and uploads',
  },
  subheading: {
    id: 'course-authoring.files-and-uploads.subheading',
    defaultMessage: 'Content',
  },
  apiStatusToastMessage: {
    id: 'course-authoring.files-and-upload.apiStatus.message',
    defaultMessage: '{actionType} {selectedRowCount} file(s)',
  },
  apiStatusAddingAction: {
    id: 'course-authoring.files-and-upload.apiStatus.addingAction.message',
    defaultMessage: 'Adding',
  },
  apiStatusDeletingAction: {
    id: 'course-authoring.files-and-upload.apiStatus.deletingAction.message',
    defaultMessage: 'Deleting',
  },
  fileSizeError: {
    id: 'course-authoring.files-and-upload.addFiles.error.fileSize',
    defaultMessage: 'Uploaded file(s) must be 20 MB or less. Please resize file(s) and try again.',
  },
  noResultsFoundMessage: {
    id: 'course-authoring.files-and-upload.table.noResultsFound.message',
    defaultMessage: 'No results found',
  },
  addFilesButtonLabel: {
    id: 'course-authoring.files-and-upload.addFiles.button.label',
    defaultMessage: 'Add files',
  },
  actionsButtonLabel: {
    id: 'course-authoring.files-and-upload.action.button.label',
    defaultMessage: 'Actions',
  },
  errorAlertMessage: {
    id: 'course-authoring.files-and-upload.errorAlert.message',
    defaultMessage: '{message}',
  },
  dateAddedTitle: {
    id: 'course-authoring.files-and-uploads.file-info.dateAdded.title',
    defaultMessage: 'Date added',
  },
  fileSizeTitle: {
    id: 'course-authoring.files-and-uploads.file-info.fileSize.title',
    defaultMessage: 'File size',
  },
  studioUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.studioUrl.title',
    defaultMessage: 'Studio URL',
  },
  webUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.webUrl.title',
    defaultMessage: 'Web URL',
  },
  lockFileTitle: {
    id: 'course-authoring.files-and-uploads.file-info.lockFile.title',
    defaultMessage: 'Lock file',
  },
  lockFileTooltipContent: {
    id: 'course-authoring.files-and-uploads.file-info.lockFile.tooltip.content',
    defaultMessage: `By default, anyone can access a file you upload if
      they know the web URL, even if they are not enrolled in your course.
      You can prevent outside access to a file by locking the file. When
      you lock a file, the web URL only allows learners who are enrolled
      in your course and signed in to access the file.`,
  },
  usageTitle: {
    id: 'course-authoring.files-and-uploads.file-info.usage.title',
    defaultMessage: 'Usage',
  },
  usageLoadingMessage: {
    id: 'course-authoring.files-and-uploads.file-info.usage.loading.message',
    defaultMessage: 'Loading',
  },
  usageNotInUseMessage: {
    id: 'course-authoring.files-and-uploads.file-info.usage.notInUse.message',
    defaultMessage: 'Currently not in use',
  },
  copyStudioUrlTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.copyStudioUrlTitle',
    defaultMessage: 'Copy Studio Url',
  },
  copyWebUrlTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.copyWebUrlTitle',
    defaultMessage: 'Copy Web Url',
  },
  downloadTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.downloadTitle',
    defaultMessage: 'Download',
  },
  lockMenuTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.lockTitle',
    defaultMessage: 'Lock',
  },
  unlockMenuTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.unlockTitle',
    defaultMessage: 'Unlock',
  },
  infoTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.infoTitle',
    defaultMessage: 'Info',
  },
  deleteTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.deleteTitle',
    defaultMessage: 'Delete',
  },
  deleteConfirmationTitle: {
    id: 'course-authoring.files-and-uploads..deleteConfirmation.title',
    defaultMessage: 'Delete File(s) Confirmation',
  },
  deleteConfirmationMessage: {
    id: 'course-authoring.files-and-uploads..deleteConfirmation.message',
    defaultMessage: 'Are you sure you want to delete {fileNumber} file(s)? This action cannot be undone.',
  },
  deleteFileButtonLabel: {
    id: 'course-authoring.files-and-uploads.deleteConfirmation.deleteFile.label',
    defaultMessage: 'Delete',
  },
  cancelButtonLabel: {
    id: 'course-authoring.files-and-uploads.deleteConfirmation.cancelButton.label',
    defaultMessage: 'Cancel',
  },
});

export default messages;
