import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  settingsWidgetTitle: {
    id: 'authoring.problemeditor.settings.settingsWidgetTitle',
    defaultMessage: 'Settings',
    description: 'Settings Title',
  },
  showAdvanceSettingsButtonText: {
    id: 'authoring.problemeditor.settings.showAdvancedButton',
    defaultMessage: 'Show advanced settings',
    description: 'Button text to show advanced settings',
  },
  settingsDeleteIconAltText: {
    id: 'authoring.problemeditor.settings.delete.icon.alt',
    defaultMessage: 'Delete answer',
    description: 'Alt text for delete icon',
  },
  advancedSettingsLinkText: {
    id: 'authoring.problemeditor.settings.advancedSettingLink.text',
    defaultMessage: 'Set a default value in advanced settings',
    description: 'Advanced settings link text',
  },
  hintSettingTitle: {
    id: 'authoring.problemeditor.settings.hint.title',
    defaultMessage: 'Hints',
    description: 'Hint settings card title',
  },
  hintInputLabel: {
    id: 'authoring.problemeditor.settings.hint.inputLabel',
    defaultMessage: 'Hint',
    description: 'Hint text input label',
  },
  addHintButtonText: {
    id: 'authoring.problemeditor.settings.hint.addHintButton',
    defaultMessage: 'Add hint',
    description: 'Add hint button text',
  },
  noHintSummary: {
    id: 'authoring.problemeditor.settings.hint.noHintSummary',
    defaultMessage: 'None',
    description: 'Summary text for no hints',
  },
  hintSummary: {
    id: 'authoring.problemeditor.settings.hint.summary',
    defaultMessage: '{hint} {count, plural, =0 {} other {(+# more)}}',
    description: 'Summary text for hint settings',
  },
  resetSettingsTitle: {
    id: 'authoring.problemeditor.settings.reset.title',
    defaultMessage: 'Show reset option',
    description: 'Reset settings card title',
  },
  resetSettingsTrue: {
    id: 'authoring.problemeditor.settings.reset.true',
    defaultMessage: 'True',
    description: 'True option for reset',
  },
  resetSettingsFalse: {
    id: 'authoring.problemeditor.settings.reset.false',
    defaultMessage: 'False',
    description: 'False option for reset',
  },
  resetSettingText: {
    id: 'authoring.problemeditor.settings.reset.text',
    defaultMessage: "Determines whether a 'Reset' button is shown so the user may reset their answer, generally for use in practice or formative assessments.",
    description: 'Reset settings card text',
  },
  scoringSettingsTitle: {
    id: 'authoring.problemeditor.settings.scoring.title',
    defaultMessage: 'Scoring',
    description: 'Scoring settings card title',
  },
  scoringAttemptsInputLabel: {
    id: 'authoring.problemeditor.settings.scoring.attempts.inputLabel',
    defaultMessage: 'Attempts',
    description: 'Scoring attempts text input label',
  },
  scoringWeightInputLabel: {
    id: 'authoring.problemeditor.settings.scoring.weight.inputLabel',
    defaultMessage: 'Points',
    description: 'Scoring weight input label',
  },
  unlimitedAttemptsSummary: {
    id: 'authoring.problemeditor.settings.scoring.unlimited',
    defaultMessage: 'Unlimited attempts',
    description: 'Summary text for unlimited attempts',
  },
  attemptsSummary: {
    id: 'authoring.problemeditor.settings.scoring.attempts',
    defaultMessage: '{attempts, plural, =1 {# attempt} other {# attempts}}',
    description: 'Summary text for number of attempts',
  },
  unlimitedAttemptsCheckboxLabel: {
    id: 'authoring.problemeditor.settings.scoring.attempts.unlimitedCheckbox',
    defaultMessage: 'Unlimited attempts',
    description: 'Label for unlimited attempts checkbox',
  },
  weightSummary: {
    id: 'authoring.problemeditor.settings.scoring.weight',
    defaultMessage: '{weight, plural, =0 {Ungraded} other {# points}}',
    description: 'Summary text for scoring weight',
  },
  scoringSettingsLabel: {
    id: 'authoring.problemeditor.settings.scoring.label',
    defaultMessage: 'Specify point weight and the number of answer attempts',
    description: 'Descriptive text for scoring settings',
  },
  attemptsHint: {
    id: 'authoring.problemeditor.settings.scoring.attempts.hint',
    defaultMessage: 'If a default value is not set in advanced settings, unlimited attempts are allowed',
    description: 'Summary text for scoring weight',
  },
  weightHint: {
    id: 'authoring.problemeditor.settings.scoring.weight.hint',
    defaultMessage: 'If a value is not set, the problem is worth one point',
    description: 'Summary text for scoring weight',
  },
  showAnswerSettingsTitle: {
    id: 'authoring.problemeditor.settings.showAnswer.title',
    defaultMessage: 'Show answer',
    description: 'Show Answer settings card title',
  },
  showAnswerAttemptsInputLabel: {
    id: 'authoring.problemeditor.settings.showAnswer.attempts.inputLabel',
    defaultMessage: 'Number of Attempts',
    description: 'Show Answer attempts text input label',
  },
  showAnswerSettingText: {
    id: 'authoring.problemeditor.settings.showAnswer.text',
    defaultMessage: 'Define when learners can see the correct answer.',
    description: 'Show Answer settings card text',
  },
  timerSettingsTitle: {
    id: 'authoring.problemeditor.settings.timer.title',
    defaultMessage: 'Time between attempts',
    description: 'Timer settings card title',
  },
  timerSummary: {
    id: 'authoring.problemeditor.settings.timer.summary',
    defaultMessage: '{time} seconds',
    description: 'Summary text for timer settings',
  },
  timerSettingText: {
    id: 'authoring.problemeditor.settings.timer.text',
    defaultMessage: 'Seconds a student must wait between submissions for a problem with multiple attempts.',
    description: 'Timer settings card text',
  },
  timerInputLabel: {
    id: 'authoring.problemeditor.settings.timer.inputLabel',
    defaultMessage: 'Seconds',
    description: 'Timer text input label',
  },
  typeSettingTitle: {
    id: 'authoring.problemeditor.settings.type.title',
    defaultMessage: 'Type',
    description: 'Type settings card title',
  },
  SwitchButtonLabel: {
    id: 'authoring.problemeditor.settings.switchtoadvancededitor.label',
    defaultMessage: 'Switch to advanced editor',
    description: 'button to switch to the advanced mode of the editor.',
  },
  ConfirmSwitchMessage: {
    id: 'authoring.problemeditor.settings.switchtoadvancededitor.ConfirmSwitchMessage',
    defaultMessage: 'If you use the advanced editor, this problem will be converted to OLX and you will not be able to return to the simple editor.',
    description: 'message to confirm that a user wants to use the advanced editor',
  },
  ConfirmSwitchMessageTitle: {
    id: 'authoring.problemeditor.settings.switchtoadvancededitor.ConfirmSwitchMessageTitle',
    defaultMessage: 'Convert to OLX?',
    description: 'message to confirm that a user wants to use the advanced editor',
  },
  ConfirmSwitchButtonLabel: {
    id: 'authoring.problemeditor.settings.switchtoadvancededitor.ConfirmSwitchButtonLabel',
    defaultMessage: 'Switch to advanced editor',
    description: 'message to confirm that a user wants to use the advanced editor',
  },
  explanationInputLabel: {
    id: 'authoring.problemeditor.settings.showAnswer.explanation.inputLabel',
    defaultMessage: 'Explanation',
    description: 'answer explanation input label',
  },
  explanationSettingText: {
    id: 'authoring.problemeditor.settings.showAnswer.explanation.text',
    defaultMessage: 'Provide an explanation for the correct answer.',
    description: 'Solution Explanation text',
  },
});

export default messages;
