import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  randomizationSettingTitle: {
    id: 'authoring.problemeditor.settings.randomization.SettingTitle',
    defaultMessage: 'Randomization',
    description: 'Settings Title for Randomization widget',
  },
  randomizationSettingText: {
    id: 'authoring.problemeditor.settings.randomization.SettingText',
    defaultMessage: `{randomization, select,
      null {No Python based randomization is present in this problem.}
      other {Defines when to randomize the variables specified in the associated Python script. For problems that do not randomize values, specify "Never".}
    }`,
    description: 'Description of Possibilities for value in Randomization widget',
  },
});

export default messages;
