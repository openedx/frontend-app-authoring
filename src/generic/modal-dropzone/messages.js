import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  uploadImageDropzoneText: {
    id: 'course-authoring.certificates.modal-dropzone.text',
    defaultMessage: 'Drag and drop your image here or click to upload',
  },
  uploadImageDropzoneAlt: {
    id: 'course-authoring.certificates.modal-dropzone.dropzone-alt',
    defaultMessage: 'Uploaded image for course certificate',
  },
  uploadImageValidationText: {
    id: 'course-authoring.certificates.modal-dropzone.validation.text',
    defaultMessage: 'Only {types} files can be uploaded. Please select a file ending in {extensions} to upload.',
  },
  cancelModal: {
    id: 'course-authoring.certificates.modal-dropzone.cancel.modal',
    defaultMessage: 'Cancel',
  },
  uploadModal: {
    id: 'course-authoring.certificates.modal-dropzone.upload.modal',
    defaultMessage: 'Upload',
  },
  uploadImageDropzoneInvalidSizeMore: {
    id: 'course-authoring.certificates.modal-dropzone.validation.invalid-size-more',
    defaultMessage: 'Image size must be less than {maxSize}MB.',
  },
});

export default messages;
