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
});

export default messages;
