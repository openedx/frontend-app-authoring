import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  rowStatusMessage: {
    id: 'course-authoring.files-and-upload.rowStatus.message',
    defaultMessage: 'Showing {fileCount} of {rowCount}',
  },
  apiStatusToastMessage: {
    id: 'course-authoring.files-and-upload.apiStatus.message',
    defaultMessage: '{actionType} {selectedRowCount} {fileType}(s)',
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
    defaultMessage: 'Add {fileType}s',
  },
  actionsButtonLabel: {
    id: 'course-authoring.files-and-upload.action.button.label',
    defaultMessage: 'Actions',
  },
  errorAlertMessage: {
    id: 'course-authoring.files-and-upload.errorAlert.message',
    defaultMessage: '{message}',
  },
  transcriptionErrorMessage: {
    id: 'course-authoring.files-and-uploads.file-info.transcripts.error.alert',
    defaultMessage: 'Transcript failed: "{error}"',
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
  copyVideoIdTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.copyVideoIdTitle',
    defaultMessage: 'Copy video ID',
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
  downloadEncodingsTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.downloadEncodingsTitle',
    defaultMessage: 'Download video list (.csv)',
  },
  deleteTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.deleteTitle',
    defaultMessage: 'Delete',
  },
  deleteConfirmationTitle: {
    id: 'course-authoring.files-and-uploads..deleteConfirmation.title',
    defaultMessage: 'Delete {fileType}(s) confirmation',
  },
  deleteConfirmationMessage: {
    id: 'course-authoring.files-and-uploads..deleteConfirmation.message',
    defaultMessage: 'Are you sure you want to delete {fileNumber} {fileType}(s)? This action cannot be undone.',
  },
  deleteFileButtonLabel: {
    id: 'course-authoring.files-and-uploads.deleteConfirmation.deleteFile.label',
    defaultMessage: 'Delete',
  },
  cancelButtonLabel: {
    id: 'course-authoring.files-and-uploads.cancelButton.label',
    defaultMessage: 'Cancel',
  },
  sortButtonLabel: {
    id: 'course-authoring.files-and-uploads.sortButton.label',
    defaultMessage: 'Sort and filter',
  },
  sortModalTitleLabel: {
    id: 'course-authoring.files-and-uploads.sortModal.title',
    defaultMessage: 'Sort by',
  },
  sortByNameAscending: {
    id: 'course-authoring.files-and-uploads.sortByNameAscendingButton.label',
    defaultMessage: 'Name (A-Z)',
  },
  sortByNewest: {
    id: 'course-authoring.files-and-uploads.sortByNewestButton.label',
    defaultMessage: 'Newest',
  },
  sortBySizeDescending: {
    id: 'course-authoring.files-and-uploads.sortBySizeDescendingButton.label',
    defaultMessage: 'File size (High to low)',
  },
  sortByNameDescending: {
    id: 'course-authoring.files-and-uploads.sortByNameDescendingButton.label',
    defaultMessage: 'Name (Z-A)',
  },
  sortByOldest: {
    id: 'course-authoring.files-and-uploads.sortByOldestButton.label',
    defaultMessage: 'Oldest',
  },
  sortBySizeAscending: {
    id: 'course-authoring.files-and-uploads.sortBySizeAscendingButton.label',
    defaultMessage: 'File size(Low to high)',
  },
  applySortButton: {
    id: 'course-authoring.files-and-uploads.applyySortButton.label',
    defaultMessage: 'Apply',
  },
});

export default messages;
