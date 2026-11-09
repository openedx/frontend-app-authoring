import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingSpinner: {
    id: 'MatchingEditor.loadingSpinner',
    defaultMessage: 'Loading Spinner',
    description: 'Loading message for spinner screenreader text.',
  },
  descriptionHeaderMatching: {
    id: 'MatchingEditor.DescriptionHeaderMatching',
    defaultMessage: 'Card pairs',
    description: 'Header for the area where pairs are added in the editor.',
  },
  startTypingHere: {
    id: 'MatchingEditor.startTypingHere',
    defaultMessage: 'Start typing here...',
    description: 'Placeholder text for entering text for the left or right card in the matching editor.',
  },
  shuffleSettingsDescription: {
    id: 'MatchingEditor.shuffleSettingsDescription',
    defaultMessage: 'Shuffle the order of cards shown to learners when reviewing.',
    description: 'Shuffle Settings Description',
  },
  leftCardLabel: {
    id: 'MatchingEditor.leftCardLabel',
    defaultMessage: 'Left',
    description: 'Label for left card input form',
  },
  rightCardLabel: {
    id: 'MatchingEditor.rightCardLabel',
    defaultMessage: 'Right',
    description: 'Label for right card input form',
  },
  settingsTitle: {
    id: 'MatchingEditor.settingsTitle',
    defaultMessage: 'Settings',
    description: 'Title for the settings sidebar in the matching editor.',
  },
  noTextLabel: {
    id: 'MatchingEditor.noTextLabel',
    defaultMessage: 'No text',
    description: 'Label shown when a card has no text content.',
  },
  cardActionsLabel: {
    id: 'MatchingEditor.cardActionsLabel',
    defaultMessage: 'Card actions',
    description: 'Accessible label for the menu button on each card that offers move up, move down and delete.',
  },
  moveUpLabel: {
    id: 'MatchingEditor.moveUpLabel',
    defaultMessage: 'Move up',
    description: 'Label for move up dropdown item.',
  },
  moveDownLabel: {
    id: 'MatchingEditor.moveDownLabel',
    defaultMessage: 'Move down',
    description: 'Label for move down dropdown item.',
  },
  deleteLabel: {
    id: 'MatchingEditor.deleteLabel',
    defaultMessage: 'Delete',
    description: 'Label for delete dropdown item.',
  },
  addLabel: {
    id: 'MatchingEditor.addLabel',
    defaultMessage: 'Add',
    description: 'Label for add button.',
  },
  shuffleLabel: {
    id: 'MatchingEditor.shuffleLabel',
    defaultMessage: 'Shuffle',
    description: 'Label for shuffle setting.',
  },
  loadErrorHeading: {
    id: 'MatchingEditor.loadErrorHeading',
    defaultMessage: 'The matching game settings could not be loaded.',
    description: 'Heading shown when fetching the block settings fails.',
  },
  expandCardLabel: {
    id: 'MatchingEditor.expandCardLabel',
    defaultMessage: 'Expand card',
    description: 'Accessible label for the button that expands a collapsed card.',
  },
  collapseCardLabel: {
    id: 'MatchingEditor.collapseCardLabel',
    defaultMessage: 'Collapse card',
    description: 'Accessible label for the button that collapses an expanded card.',
  },
  timerLabel: {
    id: 'MatchingEditor.timerLabel',
    defaultMessage: 'Timer',
    description: 'Label for timer setting.',
  },
  timerSettingsDescription: {
    id: 'MatchingEditor.timerSettingsDescription',
    defaultMessage: 'Measure the time it takes learners to match all pairs. Used to calculate a learner\'s score.',
    description: 'Matching settings description',
  },
});

export default messages;
