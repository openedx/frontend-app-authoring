import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  courseFileHint: {
    id: 'FlashcardsEditor.courseFileHint',
    defaultMessage: 'Images are automatically added to course assets (Files).',
    description: 'Hint for file upload when in a course.',
  },
  libraryFileHint: {
    id: 'FlashcardsEditor.libraryFileHint',
    defaultMessage: 'Images are automatically added to library assets.',
    description: 'Hint for file upload when in a library.',
  },
  loadingSpinner: {
    id: 'FlashcardsEditor.loadingSpinner',
    defaultMessage: 'Loading Spinner',
    description: 'Loading message for spinner screenreader text.',
  },
  descriptionHeaderFlashcard: {
    id: 'FlashcardsEditor.DescriptionHeaderFlashcard',
    defaultMessage: 'Flashcards',
    description: 'Header for the area where flashcards are added in the editor.',
  },
  startTypingHere: {
    id: 'FlashcardsEditor.startTypingHere',
    defaultMessage: 'Start typing here...',
    description: 'Placeholder text for entering text for the front or back of the flashcards editor.',
  },
  shuffleSettingsDescription: {
    id: 'FlashcardsEditor.shuffleSettingsDescription',
    defaultMessage: 'Shuffle the order of cards shown to learners when reviewing.',
    description: 'Shuffle Settings Description',
  },
  textFieldLabel: {
    id: 'FlashcardsEditor.textFieldLabel',
    defaultMessage: 'Text',
    description: 'Label for the text input field of cards (front or back)',
  },
  frontOfCardLabel: {
    id: 'FlashcardsEditor.frontOfCardLabel',
    defaultMessage: 'Front of card',
    description: 'Label for front input form',
  },
  backOfCardLabel: {
    id: 'FlashcardsEditor.backOfCardLabel',
    defaultMessage: 'Back of card',
    description: 'Label for back input form',
  },
  settingsTitle: {
    id: 'FlashcardsEditor.settingsTitle',
    defaultMessage: 'Settings',
    description: 'Title for the settings sidebar in the flashcards editor.',
  },
  noTextLabel: {
    id: 'FlashcardsEditor.noTextLabel',
    defaultMessage: 'No text',
    description: 'Label shown when a card has no text content.',
  },
  noImageLabel: {
    id: 'FlashcardsEditor.noImageLabel',
    defaultMessage: 'No image',
    description: 'Label shown when a card has no image content.',
  },
  cardActionsLabel: {
    id: 'FlashcardsEditor.cardActionsLabel',
    defaultMessage: 'Card actions',
    description: 'Accessible label for the menu button on each card that offers move up, move down and delete.',
  },
  moveUpLabel: {
    id: 'FlashcardsEditor.moveUpLabel',
    defaultMessage: 'Move up',
    description: 'Label for move up dropdown item.',
  },
  moveDownLabel: {
    id: 'FlashcardsEditor.moveDownLabel',
    defaultMessage: 'Move down',
    description: 'Label for move down dropdown item.',
  },
  deleteLabel: {
    id: 'FlashcardsEditor.deleteLabel',
    defaultMessage: 'Delete',
    description: 'Label for delete dropdown item.',
  },
  addLabel: {
    id: 'FlashcardsEditor.addLabel',
    defaultMessage: 'Add',
    description: 'Label for add button.',
  },
  shuffleLabel: {
    id: 'FlashcardsEditor.shuffleLabel',
    defaultMessage: 'Shuffle',
    description: 'Label for shuffle setting.',
  },
  altTextLabel: {
    id: 'FlashcardsEditor.altTextLabel',
    defaultMessage: 'Alt text',
    description: 'Label for the image alt-text field.',
  },
  altTextPlaceholder: {
    id: 'FlashcardsEditor.altTextPlaceholder',
    defaultMessage: 'Describe the image for someone who can’t see it. Leave blank if the image is purely decorative.',
    description: 'Placeholder for the image alt-text field.',
  },
  loadErrorHeading: {
    id: 'FlashcardsEditor.loadErrorHeading',
    defaultMessage: 'The flashcards settings could not be loaded.',
    description: 'Heading shown when fetching the block settings fails.',
  },
  imageFieldLabel: {
    id: 'FlashcardsEditor.imageFieldLabel',
    defaultMessage: 'Image',
    description: 'Header label for the file picker widget to upload an image to a card side.',
  },
  removeImageLabel: {
    id: 'FlashcardsEditor.removeImageLabel',
    defaultMessage: 'Remove image',
    description: 'Label for the button that removes the image from a card side.',
  },
  expandCardLabel: {
    id: 'FlashcardsEditor.expandCardLabel',
    defaultMessage: 'Expand card',
    description: 'Accessible label for the button that expands a collapsed card.',
  },
  collapseCardLabel: {
    id: 'FlashcardsEditor.collapseCardLabel',
    defaultMessage: 'Collapse card',
    description: 'Accessible label for the button that collapses an expanded card.',
  },
});

export default messages;
