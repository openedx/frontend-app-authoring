import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.files-and-uploads.heading',
    defaultMessage: 'Files',
    description: 'Title for the page',
  },
  thumbnailAltMessage: {
    id: 'course-authoring.files-and-uploads.thumbnail.alt',
    defaultMessage: '{displayName} file preview',
    description: 'Alternative text for thumbnail',
  },
  copyStudioUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.copyStudioUrl.title',
    defaultMessage: 'Copy Studio Url',
    description: 'Label for Copy Studio URL button in info modal',
  },
  copyWebUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.copyWebUrl.title',
    defaultMessage: 'Copy Web Url',
    description: 'Label for Copy Web URL button in info modal',
  },
  dateAddedTitle: {
    id: 'course-authoring.files-and-uploads.file-info.dateAdded.title',
    defaultMessage: 'Date added',
    description: 'Title for date added section in info modal',
  },
  fileSizeTitle: {
    id: 'course-authoring.files-and-uploads.file-info.fileSize.title',
    defaultMessage: 'File size',
    description: 'Title for file size section in info modal',
  },
  studioUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.studioUrl.title',
    defaultMessage: 'Studio URL',
    description: 'Title for studio url section in info modal',
  },
  webUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.webUrl.title',
    defaultMessage: 'Web URL',
    description: 'Title for web url section in info modal',
  },
  lockFileTitle: {
    id: 'course-authoring.files-and-uploads.file-info.lockFile.title',
    defaultMessage: 'Lock file',
    description: 'Label for lock file checkbox in info modal',
  },
  activeCheckboxLabel: {
    id: 'course-authoring.files-and-videos.file-info.activeCheckbox.label',
    defaultMessage: 'Active',
    description: 'Label for active checkbox in filter section of sort and filter modal',
  },
  inactiveCheckboxLabel: {
    id: 'course-authoring.files-and-videos.file-info.inactiveCheckbox.label',
    defaultMessage: 'Inactive',
    description: 'Label for inactive checkbox in filter section of sort and filter modal',
  },
  lockedCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.lockedCheckbox.label',
    defaultMessage: 'Locked',
    description: 'Label for locked checkbox in filter section of sort and filter modal',
  },
  publicCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.publicCheckbox.label',
    defaultMessage: 'Public',
    description: 'Label for public checkbox in filter section of sort and filter modal',
  },
  codeCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.codeCheckbox.label',
    defaultMessage: 'Code',
    description: 'Label for code checkbox in filter section of sort and filter modal',
  },
  imageCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.imageCheckbox.label',
    defaultMessage: 'Images',
    description: 'Label for images checkbox in filter section of sort and filter modal',
  },
  documentCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.documentCheckbox.label',
    defaultMessage: 'Documents',
    description: 'Label for documents checkbox in filter section of sort and filter modal',
  },
  audioCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.audioCheckbox.label',
    defaultMessage: 'Audio',
    description: 'Label for audio checkbox in filter section of sort and filter modal',
  },
  otherCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.otherCheckbox.label',
    defaultMessage: 'Other',
    description: 'Label for other checkbox in filter section of sort and filter modal',
  },
  overwriteConfirmMessage: {
    id: 'course-authoring.files-and-videos.overwrite.modal.confirmation-message',
    defaultMessage: 'Some of the uploaded files already exist in this course. Do you want to overwrite the following files?',
    description: 'The message displayed in the modal shown when uploading files with pre-existing names',
  },
  overwriteModalTitle: {
    id: 'course-authoring.files-and-videos.overwrite.modal.title',
    defaultMessage: 'Overwrite files',
    description: 'The title of the modal to confirm overwriting the files',
  },
  confirmOverwriteButtonLabel: {
    id: 'course-authoring.files-and-videos.overwrite.modal.overwrite-button.label',
    defaultMessage: 'Overwrite',
    description: 'The message displayed in the button to confirm overwriting the files',
  },
  cancelOverwriteButtonLabel: {
    id: 'course-authoring.files-and-videos.overwrite.modal.cancel-button.label',
    defaultMessage: 'Cancel',
    description: 'The message displayed in the button to confirm cancelling the upload',
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
});

export default messages;
