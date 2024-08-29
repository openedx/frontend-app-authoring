import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  // index
  titleLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.titleLabel',
    defaultMessage: 'Image Settings',
    description: 'Label title for image settings modal.',
  },
  saveButtonLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.saveButtonLabel',
    defaultMessage: 'Save',
    description: 'Label for save button.',
  },
  replaceImageButtonLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.replaceImageButtonLabel',
    defaultMessage: 'Replace image',
    description: 'Label for replace image button.',
  },

  // DimensionControls
  imageDimensionsLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.imageDimensionsLabel',
    defaultMessage: 'Image Dimensions',
    description: 'Label title for the image dimensions section.',
  },
  widthFloatingLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.widthFloatingLabel',
    defaultMessage: 'Width',
    description: 'Floating label for width input.',
  },
  heightFloatingLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.heightFloatingLabel',
    defaultMessage: 'Height',
    description: 'Floating label for height input.',
  },
  unlockDimensionsLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.unlockDimensionsLabel',
    defaultMessage: 'unlock dimensions',
    description: 'Label for button when unlocking dimensions.',
  },
  lockDimensionsLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.lockDimensionsLabel',
    defaultMessage: 'lock dimensions',
    description: 'Label for button when locking dimensions.',
  },
  decorativeDimensionCheckboxLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.decorativeDimensionCheckboxLabel',
    defaultMessage: "Use percentages for the image's width and height",
    description: 'Checkbox label for whether or not an image uses percentages for width and height.',
  },

  // AltTextControls
  accessibilityLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.accessibilityLabel',
    defaultMessage: 'Accessibility',
    description: 'Label title for accessibility section.',
  },
  altTextFloatingLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.altTextFloatingLabel',
    defaultMessage: 'Alt Text',
    description: 'Floating label title for alt text input.',
  },
  decorativeAltTextCheckboxLabel: {
    id: 'authoring.texteditor.imagesettingsmodal.decorativeAltTextCheckboxLabel',
    defaultMessage: 'This image is decorative (no alt text required).',
    description: 'Checkbox label for whether or not an image is decorative.',
  },

  // User Feedback Errors
  altTextError: {
    id: 'authoring.texteditor.imagesettingsmodal.error.altTextError',
    defaultMessage: 'Enter alt text or specify that the image is decorative only.',
    description: 'Message presented to user when user attempts to save unaccepted altText configuration.',
  },
  altTextLocalFeedback: {
    id: 'authoring.texteditor.imagesettingsmodal.error.altTextLocalFeedback',
    defaultMessage: 'Enter alt text',
    description: 'Message feedback for user below the alt text field.',
  },
  dimensionError: {
    id: 'authoring.texteditor.imagesettingsmodal.error.dimensionError',
    defaultMessage: 'Dimension values must be less than or equal to 100.',
    description: 'Message presented to user when user attempts to save unaccepted dimension configuration.',
  },
  dimensionLocalFeedback: {
    id: 'authoring.texteditor.imagesettingsmodal.error.dimensionFeedback',
    defaultMessage: 'Enter a value less than or equal to 100.',
    description: 'Message feedback for user below the dimension fields.',
  },
});

export default messages;
