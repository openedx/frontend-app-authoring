import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  dropVideoFileHere: {
    defaultMessage: 'Drag and drop video here or click to upload',
    id: 'VideoUploadEditor.dropVideoFileHere',
    description: 'Display message for Drag and Drop zone',
  },
  browse: {
    defaultMessage: 'Browse files',
    id: 'VideoUploadEditor.browse',
    description: 'Display message for browse files button',
  },
  info: {
    id: 'VideoUploadEditor.uploadInfo',
    defaultMessage: 'Upload MP4 or MOV files (5 GB max)',
    description: 'Info message for supported formats',
  },
  libraryBlockEditWarningTitle: {
    id: 'authoring.editorpage.libraryBlockEditWarningTitle',
    defaultMessage: 'Editing Content from a Library',
    description: 'Title text for Warning users editing library content in a course.',
  },
  libraryBlockEditWarningDescription: {
    id: 'authoring.editorpage.libraryBlockEditWarningDescription',
    defaultMessage: 'Edits made here will only be reflected in this course. These edits may be overridden later if updates are accepted.',
    description: 'Description text for Warning users editing library content in a course.',
  },
  libraryBlockEditWarningLink: {
    id: 'authoring.editorpage.libraryBlockEditWarningLink',
    defaultMessage: 'View in Library',
    description: 'Link text for opening library block in another tab.',
  },
  advancedEditorGenericError: {
    id: 'authoring.advancedEditor.error.generic',
    defaultMessage: 'An unexpected error occurred in the editor',
    description: 'Generic error message shown when an error occurs in the Advanced Editor.',
  },
  advancedEditorFullscreenButtonAlt: {
    id: 'authoring.advancedEditor.fullscreenButton.alt',
    defaultMessage: 'Toggle Fullscreen',
    description: 'Alt text for the Fullscreen button',
  },
});

export default messages;
