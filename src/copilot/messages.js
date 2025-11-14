// src/components/Copilot/messages.js
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  copilotTitle: {
    id: 'copilot.title',
    defaultMessage: 'Copilot',
    description: 'Main title of the Copilot panel',
  },
  generating: {
    id: 'copilot.generating',
    defaultMessage: 'Generating your content...',
    description: 'Loading message while AI generates suggestions',
  },
  error: {
    id: 'copilot.error',
    defaultMessage: 'Something went wrong. Please try again.',
    description: 'Generic error message for API failures',
  },
  retry: {
    id: 'copilot.retry',
    defaultMessage: 'Retry',
    description: 'Button to retry the last failed action',
  },
  noValue: {
    id: 'copilot.error.noValue',
    defaultMessage: 'Please provide a valid {field} to generate suggestions.',
    description: 'Error when no input is provided',
  },
  inserted: {
    id: 'copilot.inserted',
    defaultMessage: 'The {field} has been successfully inserted!',
    description: 'Success message after inserting suggestion',
  },
  placeholderMessage: {
    id: 'copilot.placeholder.message',
    defaultMessage: 'Type your message...',
    description: 'Placeholder for chat input',
  },
  placeholderAnswer: {
    id: 'copilot.placeholder.answer',
    defaultMessage: 'Type your answer...',
    description: 'Placeholder when answering a question',
  },
  buttonContinue: {
    id: 'copilot.button.continue',
    defaultMessage: 'Continue',
    description: 'Button to proceed to next field',
  },
  buttonMore: {
    id: 'copilot.button.more',
    defaultMessage: 'More Suggestions',
    description: 'Button to get more AI suggestions',
  },
  buttonCustomize: {
    id: 'copilot.button.customize',
    defaultMessage: 'Customize',
    description: 'Button to start customization flow',
  },
  customizeRequest: {
    id: 'copilot.customize.request',
    defaultMessage: 'Requesting customization options...',
    description: 'User message when starting customization',
  },
  questionCounter: {
    id: 'copilot.question.counter',
    defaultMessage: 'Q{current}/{total}',
    description: 'Question progress indicator',
  },
  fieldTitle: {
    id: 'copilot.field.title',
    defaultMessage: 'Title',
  },
  fieldShortDescription: {
    id: 'copilot.field.shortDescription',
    defaultMessage: 'Short Description',
  },
  fieldDescription: {
    id: 'copilot.field.description',
    defaultMessage: 'Description',
  },
  fieldCardImage: {
    id: 'copilot.field.cardImage',
    defaultMessage: 'Course Card Image',
  },
  fieldBannerImage: {
    id: 'copilot.field.bannerImage',
    defaultMessage: 'Banner Image',
  },
  continueTitle: {
    id: 'copilot.continue.title',
    defaultMessage: 'Create a title using Copilot. Click Continue.',
  },
  continueShortDescription: {
    id: 'copilot.continue.shortDescription',
    defaultMessage: 'Create a Short Description using Copilot. Click Continue.',
  },
  continueDescription: {
    id: 'copilot.continue.description',
    defaultMessage: 'Generate a detailed Description. Click Continue.',
  },
  continueCardImage: {
    id: 'copilot.continue.cardImage',
    defaultMessage: 'Design a Course Card Image. Click Continue.',
  },
  continueBannerImage: {
    id: 'copilot.continue.bannerImage',
    defaultMessage: 'Create a Banner Image. Click Continue.'
  },
  tooltipClickToInsert: {
    id: 'copilot.tooltip.clickToInsert',
    defaultMessage: 'Click to insert',
  },
  tooltipRemovePinned: {
    id: 'copilot.tooltip.removePinned',
    defaultMessage: 'Remove',
  },
  tooltipPin: {
    id: 'copilot.tooltip.pin',
    defaultMessage: 'Pin',
  },
  tooltipUnpin: {
    id: 'copilot.tooltip.unpin',
    defaultMessage: 'Unpin',
  },
  altSelectedImage: {
    id: 'copilot.alt.selectedImage',
    defaultMessage: 'Selected image',
  },
  altSuggestionImage: {
    id: 'copilot.alt.suggestionImage',
    defaultMessage: 'Suggested image',
  },
  tooltipDragToMove: {
    id: 'copilot.tooltip.dragToMove',
    defaultMessage: 'click to Undocked',
  },
  tooltipResize: {
    id: 'copilot.tooltip.resize',
    defaultMessage: 'Drag to resize',
  },
  altPinnedImage: {
    id: 'copilot.alt.pinnedImage',
    defaultMessage: 'Pinned image',
  },
  loadingcopilot: {
    id: 'copilot.loadingcopilot',
    defaultMessage: 'Coming Soon',
    description: 'Message shown when Copilot is loading or not yet available',
  },
});

export default messages;