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
  useMfeThemingLabel: {
    id: 'authoring.texteditor.useMfeTheming.label',
    defaultMessage: 'Apply theme styles',
    description: 'Label for the toggle that applies the site theme to this text block',
  },
  useMfeThemingHelp: {
    id: 'authoring.texteditor.useMfeTheming.help',
    defaultMessage: 'This text uses your site\'s theme for fonts, heading styles and spacing. Turn off to keep the old styling.',
    description: 'Help text for the toggle that applies the site theme to this text block',
  },
});

export default messages;
