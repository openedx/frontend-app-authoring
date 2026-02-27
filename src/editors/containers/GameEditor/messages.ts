import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingSpinner: {
    id: 'GameEditor.loadingSpinner',
    defaultMessage: 'Loading Spinner',
    description: 'Loading message for spinner screenreader text.',
  },
  descriptionHeaderFlashcard: {
    id: 'GameEditor.DescriptionHeaderFlashcard',
    defaultMessage: 'Flashcard terms',
    description: 'Flashcard Description Header',
  },
  descriptionHeaderMatching: {
    id: 'GameEditor.DescriptionHeaderMatching',
    defaultMessage: 'Matching terms',
    description: 'Matching Description Header',
  },
  undefined: {
    id: 'GameEditor.Undefined',
    defaultMessage: 'Undefined',
    description: 'Undefined Description',
  },
  descriptionFlashcard: {
    id: 'GameEditor.DescriptionFlashcard',
    defaultMessage: 'Enter your terms and definitions below. Learners will review each card by viewing the term, then flipping to reveal the definition.',
    description: 'Flashcard Description',
  },
  descriptionMatching: {
    id: 'GameEditor.DescriptionMatching',
    defaultMessage: 'Enter your terms and definitions below. Learners must match each term with the correct definition.',
    description: 'Matching Description',
  },
  timerSettingsDescription: {
    id: 'GameEditor.TimerSettingsDescription',
    defaultMessage: 'Measure the time it takes learners to match all terms and definitions. Used to calculate a learner&apos;s score.',
    description: 'Timer Settings Option Description',
  },
  enterYourTerm: {
    id: 'GameEditor.enterYourTerm',
    defaultMessage: 'Enter your term',
    description: 'Placeholder text for entering a term in the game editor.',
  },
  enterYourDefinition: {
    id: 'GameEditor.enterYourDefinition',
    defaultMessage: 'Enter your definition',
    description: 'Placeholder text for entering a definition in the game editor.',
  },
  shuffleSettingsDescription: {
    id: 'GameEditor.shuffleSettingsDescription',
    defaultMessage: 'Shuffle the order of terms shown to learners when reviewing.',
    description: 'Shuffle Settings Description',
  },
  termLabel: {
    id: 'GameEditor.termLabel',
    defaultMessage: 'Term',
    description: 'Label for term input field',
  },
  definitionLabel: {
    id: 'GameEditor.definitionLabel',
    defaultMessage: 'Definition',
    description: 'Label for definition input field',
  },
  termValidationError: {
    id: 'GameEditor.termValidationError',
    defaultMessage: 'Enter a term',
    description: 'Error message when term field is empty but definition is filled',
  },
  definitionValidationError: {
    id: 'GameEditor.definitionValidationError',
    defaultMessage: 'Enter a definition',
    description: 'Error message when definition field is empty but term is filled',
  },
  imageWithoutTextError: {
    id: 'GameEditor.imageWithoutTextError',
    defaultMessage: 'Text is required for flashcard images.',
    description: 'Error message when a flashcard has an image but no text',
  },
  settingsTitle: {
    id: 'GameEditor.settingsTitle',
    defaultMessage: 'Settings',
    description: 'Title for the settings sidebar in the game editor.',
  },
  validationErrorHeading: {
    id: 'GameEditor.validationErrorHeading',
    defaultMessage: 'We couldn\'t save your changes.',
    description: 'Heading for validation errors alert in the game editor.',
  },
  validationErrorAlert: {
    id: 'GameEditor.validationErrorAlert',
    defaultMessage: 'Please check your entries and try again.',
    description: 'Alert message for validation errors in the game editor.',
  },
  noTextLabel: {
    id: 'GameEditor.noTextLabel',
    defaultMessage: 'No text',
    description: 'Label shown when a card has no text content.',
  },
  noImageLabel: {
    id: 'GameEditor.noImageLabel',
    defaultMessage: 'No image',
    description: 'Label shown when a card has no image content.',
  },
  moveUpLabel: {
    id: 'GameEditor.moveUpLabel',
    defaultMessage: 'Move up',
    description: 'Label for move up dropdown item.',
  },
  moveDownLabel: {
    id: 'GameEditor.moveDownLabel',
    defaultMessage: 'Move down',
    description: 'Label for move down dropdown item.',
  },
  deleteLabel: {
    id: 'GameEditor.deleteLabel',
    defaultMessage: 'Delete',
    description: 'Label for delete dropdown item.',
  },
  addLabel: {
    id: 'GameEditor.addLabel',
    defaultMessage: 'Add',
    description: 'Label for add button.',
  },
  typeLabel: {
    id: 'GameEditor.typeLabel',
    defaultMessage: 'Type',
    description: 'Label for type setting.',
  },
  flashcardsLabel: {
    id: 'GameEditor.flashcardsLabel',
    defaultMessage: 'Flashcards',
    description: 'Label for flashcards game type.',
  },
  matchingLabel: {
    id: 'GameEditor.matchingLabel',
    defaultMessage: 'Matching',
    description: 'Label for matching game type.',
  },
  shuffleLabel: {
    id: 'GameEditor.shuffleLabel',
    defaultMessage: 'Shuffle',
    description: 'Label for shuffle setting.',
  },
  timerLabel: {
    id: 'GameEditor.timerLabel',
    defaultMessage: 'Timer',
    description: 'Label for timer setting.',
  },
  offLabel: {
    id: 'GameEditor.offLabel',
    defaultMessage: 'Off',
    description: 'Label for off toggle button.',
  },
  onLabel: {
    id: 'GameEditor.onLabel',
    defaultMessage: 'On',
    description: 'Label for on toggle button.',
  },
  imageSettingsTooltip: {
    id: 'GameEditor.imageSettingsTooltip',
    defaultMessage: 'Image settings',
    description: 'Tooltip for image settings button.',
  },
  imageSettingsTitle: {
    id: 'GameEditor.imageSettingsTitle',
    defaultMessage: 'Image Settings',
    description: 'Title for image settings modal.',
  },
  saveButtonLabel: {
    id: 'GameEditor.saveButtonLabel',
    defaultMessage: 'Save',
    description: 'Label for save button in image settings modal.',
  },
  altTextError: {
    id: 'GameEditor.altTextError',
    defaultMessage: 'Alt text is required for non-decorative images.',
    description: 'Error message when alt text is missing.',
  },
});

export default messages;
