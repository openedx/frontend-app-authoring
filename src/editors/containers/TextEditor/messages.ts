import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  couldNotLoadTextContext: {
    id: 'authoring.texteditor.load.error',
    defaultMessage: 'Error: Could Not Load Text Content',
    description: 'Error Message Dispayed When HTML content fails to Load',
  },
  spinnerScreenReaderText: {
    id: 'authoring.texteditor.spinnerScreenReaderText',
    defaultMessage: 'loading',
    description: 'Loading message for spinner screenreader text.',
  },
  includeThemeLabel: {
    id: 'authoring.texteditor.includeTheme.label',
    defaultMessage: 'Use MFE Theme',
    description: 'Label for the toggle that opts this text block into the MFE theme',
  },
});

export default messages;
