import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  uploadImageDropzoneText: {
    id: 'course-authoring.certificates.modal-dropzone.text',
    defaultMessage: 'Drag and drop your image here or click to upload',
    description: 'Description to drag and drop block',
  },
  uploadImageDropzoneAlt: {
    id: 'course-authoring.certificates.modal-dropzone.dropzone-alt',
    defaultMessage: 'Uploaded image for course certificate',
    description: 'Description for the uploaded image',
  },
  uploadImageValidationText: {
    id: 'course-authoring.certificates.modal-dropzone.validation.text',
    defaultMessage: 'Only {types} files can be uploaded. Please select a file ending in {extensions} to upload.',
    description: 'Error message for when an invalid file type is selected',
  },
  cancelModal: {
    id: 'course-authoring.certificates.modal-dropzone.cancel.modal',
    defaultMessage: 'Cancel',
    description: 'Text for the cancel button in the modal',
  },
  uploadModal: {
    id: 'course-authoring.certificates.modal-dropzone.upload.modal',
    defaultMessage: 'Upload',
    description: 'Text for the upload button in the modal',
  },
  uploadImageDropzoneInvalidSizeMore: {
    id: 'course-authoring.certificates.modal-dropzone.validation.invalid-size-more',
    defaultMessage: 'Image size must be less than {maxSize}MB.',
    description: 'Error message for when the uploaded image size exceeds the limit',
  },
});

export default messages;
