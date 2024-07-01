import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  rowStatusMessage: {
    id: 'course-authoring.files-and-upload.rowStatus.message',
    defaultMessage: 'Showing {fileCount} of {rowCount}',
    description: 'This message is showed to notify user of the number of files being shown',
  },
  apiStatusToastMessage: {
    id: 'course-authoring.files-and-upload.apiStatus.message',
    defaultMessage: '{actionType} {selectedRowCount} {selectedRowCount, plural, one {{fileType}} other {{fileType}s}}',
    description: 'This message is showed in the toast when action is applied to files',
  },
  apiStatusAddingAction: {
    id: 'course-authoring.files-and-upload.apiStatus.addingAction.message',
    defaultMessage: 'Adding',
    description: 'This message is used in the toast when files are added',
  },
  apiStatusDeletingAction: {
    id: 'course-authoring.files-and-upload.apiStatus.deletingAction.message',
    defaultMessage: 'Deleting',
    description: 'This message is used in the toast when files are deleted',
  },
  apiStatusDownloadingAction: {
    id: 'course-authoring.files-and-upload.apiStatus.downloadingAction.message',
    defaultMessage: 'Downloading',
    description: 'This message is used in the toast when files are downloaded',
  },
  fileSizeError: {
    id: 'course-authoring.files-and-upload.addFiles.error.fileSize',
    defaultMessage: 'Uploaded file(s) must be 20 MB or less. Please resize file(s) and try again.',
    description: 'This error message is shown when user tries to upload a file larger than 20 MB',
  },
  noResultsFoundMessage: {
    id: 'course-authoring.files-and-upload.table.noResultsFound.message',
    defaultMessage: 'No results found',
    description: 'This message is shown when no files are found based on name search',
  },
  addFilesButtonLabel: {
    id: 'course-authoring.files-and-upload.addFiles.button.label',
    defaultMessage: 'Add {fileType}s',
    description: 'Label for add files button, name changes based on page',
  },
  actionsButtonLabel: {
    id: 'course-authoring.files-and-upload.action.button.label',
    defaultMessage: 'Actions',
    description: 'Label for actions dropdown button',
  },
  errorAlertMessage: {
    id: 'course-authoring.files-and-upload.errorAlert.message',
    defaultMessage: '{message}',
    description: 'Message shell for error alert',
  },
  transcriptionErrorMessage: {
    id: 'course-authoring.files-and-uploads.file-info.transcripts.error.alert',
    defaultMessage: 'Transcript failed: "{error}"',
    description: 'Message for transcript error in info modal',
  },
  usageTitle: {
    id: 'course-authoring.files-and-uploads.file-info.usage.title',
    defaultMessage: 'Usage',
    description: 'Title for usage information section in info modal',
  },
  usageLoadingMessage: {
    id: 'course-authoring.files-and-uploads.file-info.usage.loading.message',
    defaultMessage: 'Loading',
    description: 'Screen reader text for loading spinner in usage information section',
  },
  usageNotInUseMessage: {
    id: 'course-authoring.files-and-uploads.file-info.usage.notInUse.message',
    defaultMessage: 'Currently not in use',
    description: 'Message for usage information section when file is not used in course',
  },
  copyVideoIdTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.copyVideoIdTitle',
    defaultMessage: 'Copy video ID',
    description: 'Label for copy video id button in card menu dropdown',
  },
  copyStudioUrlTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.copyStudioUrlTitle',
    defaultMessage: 'Copy Studio Url',
    description: 'Label for copy studio url button in card menu dropdown',
  },
  copyWebUrlTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.copyWebUrlTitle',
    defaultMessage: 'Copy Web Url',
    description: 'Label for copy web url button in card menu dropdown',
  },
  downloadTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.downloadTitle',
    defaultMessage: 'Download',
    description: 'Label for download button in card menu dropdown',
  },
  lockMenuTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.lockTitle',
    defaultMessage: 'Lock',
    description: 'Label for lock button in card menu dropdown',
  },
  lockFileTooltipContent: {
    id: 'course-authoring.files-and-uploads.file-info.lockFile.tooltip.content',
    defaultMessage: `By default, anyone can access a file you upload if
      they know the web URL, even if they are not enrolled in your course.
      You can prevent outside access to a file by locking the file. When
      you lock a file, the web URL only allows learners who are enrolled
      in your course and signed in to access the file.`,
    description: 'Tooltip message for the lock icon in the table view of files',
  },
  unlockMenuTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.unlockTitle',
    defaultMessage: 'Unlock',
    description: 'Label for unlock button in card menu dropdown',
  },
  infoTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.infoTitle',
    defaultMessage: 'Info',
    description: 'Label for info button in card menu dropdown',
  },
  downloadEncodingsTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.downloadEncodingsTitle',
    defaultMessage: 'Download video list (.csv)',
    description: 'Label for download video list button in actions dropdown',
  },
  deleteTitle: {
    id: 'course-authoring.files-and-uploads.cardMenu.deleteTitle',
    defaultMessage: 'Delete',
    description: 'Label for delete button in card menu dropdown',
  },
  deleteConfirmationTitle: {
    id: 'course-authoring.files-and-uploads.deleteConfirmation.title',
    defaultMessage: 'Delete {fileNumber, plural, one {{fileName}} other {{fileNumber} {fileType}s}}',
    description: 'Title for delete confirmation modal',
  },
  deleteConfirmationMessage: {
    id: 'course-authoring.files-and-uploads.deleteConfirmation.message',
    defaultMessage: `
      Are you sure you want to delete {fileNumber, plural, one {{fileName}} other {{fileNumber} {fileType}s}}?
      This action cannot be undone and may break your course if the {fileNumber, plural, one {{fileType} is} other {{fileType}s are}}
      used in the course content, advanced settings, updates, or schedule and details.
    `,
    description: 'Message presented to user listing the number of files they are attempting to delete in the delete confirmation modal',
  },
  deleteConfirmationUsageMessage: {
    id: 'course-authoring.files-and-uploads.deleteConfirmation.usage-message',
    defaultMessage: 'The following {fileNumber, plural, one {{fileType} is} other {{fileType}s are}} used in course content. Consider updating the content before deleting.',
    description: 'Message listing where the files the user is attempting to delete are used in the course',
  },
  deleteFileButtonLabel: {
    id: 'course-authoring.files-and-uploads.deleteConfirmation.deleteFile.label',
    defaultMessage: 'Delete',
    description: 'Label for delete button in delete confirmation modal modal',
  },
  cancelButtonLabel: {
    id: 'course-authoring.files-and-uploads.cancelButton.label',
    defaultMessage: 'Cancel',
    description: 'Label for cancel button in modals',
  },
  sortButtonLabel: {
    id: 'course-authoring.files-and-uploads.sortButton.label',
    defaultMessage: 'Sort and filter',
    description: 'Label for button that opens the sort and filter modal',
  },
  sortModalTitleLabel: {
    id: 'course-authoring.files-and-uploads.sortModal.title',
    defaultMessage: 'Sort by',
    description: 'Title for Sort By secition in sort and filter modal',
  },
  sortByNameAscending: {
    id: 'course-authoring.files-and-uploads.sortByNameAscendingButton.label',
    defaultMessage: 'Name (A-Z)',
    description: 'Label for ascending name radio button in sort and filter modal',
  },
  sortByNewest: {
    id: 'course-authoring.files-and-uploads.sortByNewestButton.label',
    defaultMessage: 'Newest',
    description: 'Label for descending date added radio button in sort and filter modal',
  },
  sortBySizeDescending: {
    id: 'course-authoring.files-and-uploads.sortBySizeDescendingButton.label',
    defaultMessage: 'File size (High to low)',
    description: 'Label for descending file size radio button in sort and filter modal',
  },
  sortByNameDescending: {
    id: 'course-authoring.files-and-uploads.sortByNameDescendingButton.label',
    defaultMessage: 'Name (Z-A)',
    description: 'Label for descending name radio button in sort and filter modal',
  },
  sortByOldest: {
    id: 'course-authoring.files-and-uploads.sortByOldestButton.label',
    defaultMessage: 'Oldest',
    description: 'Label for ascending date added radio button in sort and filter modal',
  },
  sortBySizeAscending: {
    id: 'course-authoring.files-and-uploads.sortBySizeAscendingButton.label',
    defaultMessage: 'File size(Low to high)',
    description: 'Label for ascending file size radio button in sort and filter modal',
  },
  applySortButton: {
    id: 'course-authoring.files-and-uploads.applyySortButton.label',
    defaultMessage: 'Apply',
    description: 'Label for apply sort button in sort and filter modal',
  },
  failedLabel: {
    id: 'course-authoring.files-and-uploads.filter.failed.label',
    defaultMessage: 'Failed',
    description: 'Label for failed sort button in sort and filter modal',
  },
  uploadErrorAlertTitle: {
    id: 'course-authoring.files-and-uploads.error.upload.title',
    defaultMessage: 'Upload error',
    description: 'Title for upload error alert',
  },
});

export default messages;
