import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  uploadImageHelpText: {
    id: 'course-authoring.schedule-section.introducing.upload-image.help-text',
    defaultMessage: 'Please provide a valid path and name to your {identifierFieldText} (Note: only JPEG or PNG format supported)',
  },
  uploadImageFilesAndUploads: {
    id: 'course-authoring.schedule-section.introducing.upload-image.file-and-uploads',
    defaultMessage: 'files and uploads',
  },
  uploadImageDropzoneText: {
    id: 'course-authoring.schedule-section.introducing.upload-image.dropzone-text',
    defaultMessage: 'Drag and drop your {identifierFieldText} here or click to upload.',
  },
  uploadImageDropzoneAlt: {
    id: 'course-authoring.schedule-section.introducing.upload-image.dropzone-alt',
    defaultMessage: 'Uploaded image for course',
  },
  uploadImageEmpty: {
    id: 'course-authoring.schedule-section.introducing.upload-image.empty',
    defaultMessage: 'Your course currently does not have an image. Please upload one (JPEG or PNG format, and minimum suggested dimensions are 375px wide by 200px tall)',
  },
  uploadImageIconAlt: {
    id: 'course-authoring.schedule-section.introducing.upload-image.icon-alt',
    defaultMessage: 'File upload icon',
  },
  uploadImageBodyFilled: {
    id: 'course-authoring.schedule-section.introducing.upload-image.manage',
    defaultMessage: 'You can manage this image along with all of your other {hyperlink}',
  },
  uploadImageInputPlaceholder: {
    id: 'course-authoring.schedule-section.introducing.upload-image.input.placeholder',
    defaultMessage: 'Your {identifierFieldText} URL',
  },
});

export default messages;
