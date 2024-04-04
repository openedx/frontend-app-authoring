import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.files-and-uploads.heading',
    defaultMessage: 'Files',
  },
  thumbnailAltMessage: {
    id: 'course-authoring.files-and-uploads.thumbnail.alt',
    defaultMessage: '{displayName} file preview',
  },
  copyStudioUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.copyStudioUrl.title',
    defaultMessage: 'Copy Studio Url',
  },
  copyWebUrlTitle: {
    id: 'course-authoring.files-and-uploads.file-info.copyWebUrl.title',
    defaultMessage: 'Copy Web Url',
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
  activeCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.activeCheckbox.label',
    defaultMessage: 'Active',
  },
  inactiveCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.inactiveCheckbox.label',
    defaultMessage: 'Inactive',
  },
  lockedCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.lockedCheckbox.label',
    defaultMessage: 'Locked',
  },
  publicCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.publicCheckbox.label',
    defaultMessage: 'Public',
  },
  codeCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.codeCheckbox.label',
    defaultMessage: 'Code',
  },
  imageCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.imageCheckbox.label',
    defaultMessage: 'Images',
  },
  documentCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.documentCheckbox.label',
    defaultMessage: 'Documents',
  },
  audioCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.audioCheckbox.label',
    defaultMessage: 'Audio',
  },
  otherCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.otherCheckbox.label',
    defaultMessage: 'Other',
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
});

export default messages;
