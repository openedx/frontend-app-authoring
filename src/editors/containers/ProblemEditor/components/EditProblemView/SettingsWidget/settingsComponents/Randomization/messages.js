import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  randomizationSettingTitle: {
    id: 'authoring.problemeditor.settings.randomization.SettingTitle',
    defaultMessage: 'Randomization',
    description: 'Settings Title for Randomization widget',
  },
  randomizationSettingText: {
    id: 'authoring.problemeditor.settings.randomization.SettingText',
    defaultMessage: 'Defines when to randomize the variables specified in the associated Python script. For problems that do not randomize values, specify "Never".',
    description: 'Description of Possibilities for value in Randomization widget',
  },
  noRandomizationSummary: {
    id: 'authoring.problemeditor.settings.randomization.noRandomizationSummary',
    defaultMessage: 'No Python based randomization is present in this problem.',
    description: 'text shown when no randomization option is given',
  },
});

export default messages;
