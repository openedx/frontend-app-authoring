import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  tabTitleLabel: {
    id: 'course-authoring.textbooks.form.tab-title.label',
    defaultMessage: 'Textbook name',
  },
  tabTitlePlaceholder: {
    id: 'course-authoring.textbooks.form.tab-title.placeholder',
    defaultMessage: 'Introduction to Cookie Baking',
  },
  tabTitleHelperText: {
    id: 'course-authoring.textbooks.form.tab-title.helper-text',
    defaultMessage: 'provide the title/name of the text book as you would like your students to see it',
  },
  tabTitleValidationText: {
    id: 'course-authoring.textbooks.form.tab-title.validation-text',
    defaultMessage: 'Textbook name is required',
  },
  chapterTitleLabel: {
    id: 'course-authoring.textbooks.form.chapter.title.label',
    defaultMessage: 'Chapter name',
  },
  chapterTitlePlaceholder: {
    id: 'course-authoring.textbooks.form.chapter.title.placeholder',
    defaultMessage: 'Chapter {value}',
  },
  chapterTitleHelperText: {
    id: 'course-authoring.textbooks.form.chapter.title.helper-text',
    defaultMessage: 'provide the title/name of the chapter that will be used in navigating',
  },
  chapterTitleValidationText: {
    id: 'course-authoring.textbooks.form.chapter.title.validation-text',
    defaultMessage: 'Chapter name is required',
  },
  chapterUrlLabel: {
    id: 'course-authoring.textbooks.form.chapter.url.label',
    defaultMessage: 'Chapter asset',
  },
  chapterUrlPlaceholder: {
    id: 'course-authoring.textbooks.form.chapter.url.placeholder',
    defaultMessage: 'path/to/introductionToCookieBaking-CH1.pdf',
  },
  chapterUrlHelperText: {
    id: 'course-authoring.textbooks.form.chapter.url.helper-text',
    defaultMessage: 'upload a PDF file or provide the path to a Studio asset file',
  },
  chapterUrlValidationText: {
    id: 'course-authoring.textbooks.form.chapter.url.validation-text',
    defaultMessage: 'Chapter asset is required',
  },
  addChapterHelperText: {
    id: 'course-authoring.textbooks.form.add-chapter.helper-text',
    defaultMessage: 'Please add at least one chapter',
  },
  addChapterButton: {
    id: 'course-authoring.textbooks.form.add-chapter.button',
    defaultMessage: 'Add a chapter',
  },
  uploadButtonTooltip: {
    id: 'course-authoring.textbooks.form.upload-button.tooltip',
    defaultMessage: 'Upload',
  },
  uploadButtonAlt: {
    id: 'course-authoring.textbooks.form.upload-button.alt',
    defaultMessage: 'chapter-upload-button',
  },
  deleteButtonTooltip: {
    id: 'course-authoring.textbooks.form.delete-button.tooltip',
    defaultMessage: 'Delete',
  },
  deleteButtonAlt: {
    id: 'course-authoring.textbooks.form.delete-button.alt',
    defaultMessage: 'chapter-delete-button',
  },
  cancelButton: {
    id: 'course-authoring.textbooks.form.button.cancel',
    defaultMessage: 'Cancel',
  },
  saveButton: {
    id: 'course-authoring.textbooks.form.button.save',
    defaultMessage: 'Save',
  },
  uploadModalTitle: {
    id: 'course-authoring.textbooks.form.upload-modal.title',
    defaultMessage: 'Upload a new PDF to “{courseName}”',
  },
  uploadModalDropzoneText: {
    id: 'course-authoring.textbooks.form.upload-modal.dropzone-text',
    defaultMessage: 'Drag and drop your PDF file here or click to upload',
  },
  uploadModalHelperText: {
    id: 'course-authoring.textbooks.form.upload-modal.help-text',
    defaultMessage: 'File must be in PDF format',
  },
  uploadModalFileInvalidSizeText: {
    id: 'course-authoring.textbooks.form.upload-modal.file-size-invalid-text',
    defaultMessage: 'File size must be less than {maxSize}MB.',
  },
});

export default messages;
