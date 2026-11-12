import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  courseFileHint: {
    id: 'FlashcardsEditor.courseFileHint',
    defaultMessage: 'Files are immediately uploaded to course assets (Files).',
    description: 'Hint for file upload when in a course.',
  },
  libraryFileHint: {
    id: 'FlashcardsEditor.libraryFileHint',
    defaultMessage: 'Files are immediately uploaded to library assets.',
    description: 'Hint for file upload when in a library.',
  },
  loadingSpinner: {
    id: 'FlashcardsEditor.loadingSpinner',
    defaultMessage: 'Loading Spinner',
    description: 'Loading message for spinner screenreader text.',
  },
  descriptionHeaderFlashcard: {
    id: 'FlashcardsEditor.DescriptionHeaderFlashcard',
    defaultMessage: 'Flashcard terms',
    description: 'Flashcard Description Header',
  },
  descriptionFlashcard: {
    id: 'FlashcardsEditor.DescriptionFlashcard',
    defaultMessage: 'Enter your terms and definitions below. Learners will review each card by viewing the term, then flipping to reveal the definition.',
    description: 'Flashcard Description',
  },
  enterYourTerm: {
    id: 'FlashcardsEditor.enterYourTerm',
    defaultMessage: 'Enter your term',
    description: 'Placeholder text for entering a term in the flashcards editor.',
  },
  enterYourDefinition: {
    id: 'FlashcardsEditor.enterYourDefinition',
    defaultMessage: 'Enter your definition',
    description: 'Placeholder text for entering a definition in the flashcards editor.',
  },
  shuffleSettingsDescription: {
    id: 'FlashcardsEditor.shuffleSettingsDescription',
    defaultMessage: 'Shuffle the order of terms shown to learners when reviewing.',
    description: 'Shuffle Settings Description',
  },
  termLabel: {
    id: 'FlashcardsEditor.termLabel',
    defaultMessage: 'Term',
    description: 'Label for term input field',
  },
  definitionLabel: {
    id: 'FlashcardsEditor.definitionLabel',
    defaultMessage: 'Definition',
    description: 'Label for definition input field',
  },
  termValidationError: {
    id: 'FlashcardsEditor.termValidationError',
    defaultMessage: 'Enter a term',
    description: 'Error message when term field is empty but definition is filled',
  },
  definitionValidationError: {
    id: 'FlashcardsEditor.definitionValidationError',
    defaultMessage: 'Enter a definition',
    description: 'Error message when definition field is empty but term is filled',
  },
  imageWithoutTextError: {
    id: 'FlashcardsEditor.imageWithoutTextError',
    defaultMessage: 'Text is required for flashcard images.',
    description: 'Error message when a flashcard has an image but no text',
  },
  settingsTitle: {
    id: 'FlashcardsEditor.settingsTitle',
    defaultMessage: 'Settings',
    description: 'Title for the settings sidebar in the flashcards editor.',
  },
  validationErrorHeading: {
    id: 'FlashcardsEditor.validationErrorHeading',
    defaultMessage: 'We couldn\'t save your changes.',
    description: 'Heading for validation errors alert in the flashcards editor.',
  },
  validationErrorAlert: {
    id: 'FlashcardsEditor.validationErrorAlert',
    defaultMessage: 'Please check your entries and try again.',
    description: 'Alert message for validation errors in the flashcards editor.',
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
  offLabel: {
    id: 'FlashcardsEditor.offLabel',
    defaultMessage: 'Off',
    description: 'Label for off toggle button.',
  },
  onLabel: {
    id: 'FlashcardsEditor.onLabel',
    defaultMessage: 'On',
    description: 'Label for on toggle button.',
  },
  imageSettingsTooltip: {
    id: 'FlashcardsEditor.imageSettingsTooltip',
    defaultMessage: 'Image settings',
    description: 'Tooltip for image settings button.',
  },
  imageSettingsTitle: {
    id: 'FlashcardsEditor.imageSettingsTitle',
    defaultMessage: 'Image Settings',
    description: 'Title for image settings modal.',
  },
  saveButtonLabel: {
    id: 'FlashcardsEditor.saveButtonLabel',
    defaultMessage: 'Save',
    description: 'Label for save button in image settings modal.',
  },
  altTextLabel: {
    id: 'FlashcardsEditor.altTextLabel',
    defaultMessage: 'Alt text',
    description: 'Label for the image alt-text field.',
  },
  loadErrorHeading: {
    id: 'FlashcardsEditor.loadErrorHeading',
    defaultMessage: 'The flashcards settings could not be loaded.',
    description: 'Heading shown when fetching the block settings fails.',
  },
  addImageLabel: {
    id: 'FlashcardsEditor.addImageLabel',
    defaultMessage: 'Add image',
    description: 'Accessible label for the button that opens the file picker to add an image to a card side.',
  },
  removeImageLabel: {
    id: 'FlashcardsEditor.removeImageLabel',
    defaultMessage: 'Remove image',
    description: 'Accessible label for the button that removes the image from a card side.',
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
  requestErrorHeading: {
    id: 'FlashcardsEditor.requestErrorHeading',
    defaultMessage: 'The last image change could not be saved.',
    description: 'Heading shown when an image upload or removal fails.',
  },
  saveErrorHeading: {
    id: 'FlashcardsEditor.saveErrorHeading',
    defaultMessage: 'The flashcards game could not be saved.',
    description: 'Heading shown when the save request fails.',
  },
});

export default messages;
