import { parseScoringSettings, parseSettings, parseShowAnswer } from './SettingsParser';
import {
  checklistWithFeebackHints,
  dropdownWithFeedbackHints,
  numericWithHints,
  textInputWithHints,
  singleSelectWithHints,
} from './mockData/problemTestData';

describe('Test Settings to State Parser', () => {
  test('Test all fields populated', () => {
    const settings = parseSettings(checklistWithFeebackHints.metadata);
    const { hints, ...settingsPayload } = checklistWithFeebackHints.state.settings;
    expect(settings).toStrictEqual(settingsPayload);
  });

  test('Test partial fields populated', () => {
    const settings = parseSettings(dropdownWithFeedbackHints.metadata);
    const { hints, ...settingsPayload } = dropdownWithFeedbackHints.state.settings;
    expect(settings).not.toStrictEqual(settingsPayload);
    const { randomization, matLabApiKey, ...settingsPayloadPartial } = settingsPayload;
    expect(settings).toStrictEqual(settingsPayloadPartial);
  });

  test('Test score settings', () => {
    const scoreSettings = parseScoringSettings(checklistWithFeebackHints.metadata);
    expect(scoreSettings).toStrictEqual(checklistWithFeebackHints.state.settings.scoring);
  });

  test('Test score settings zero attempts', () => {
    const scoreSettings = parseScoringSettings(numericWithHints.metadata);
    expect(scoreSettings).toStrictEqual(numericWithHints.state.settings.scoring);
  });

  test('Test score settings attempts missing', () => {
    const scoreSettings = parseScoringSettings(textInputWithHints.metadata);
    expect(scoreSettings.attempts).toBeUndefined();
  });

  test('Test score settings missing', () => {
    const settings = parseSettings(singleSelectWithHints.metadata);
    expect(settings.scoring).toBeUndefined();
  });

  test('Test invalid randomization', () => {
    const settings = parseSettings(numericWithHints.metadata);
    expect(settings.randomization).toBeUndefined();
  });

  test('Test invalid show answer', () => {
    const showAnswerSettings = parseShowAnswer(numericWithHints.metadata);
    expect(showAnswerSettings.on).toBeUndefined();
  });

  test('Test show answer settings missing', () => {
    const settings = parseShowAnswer(textInputWithHints.metadata);
    expect(settings.showAnswer).toBeUndefined();
  });

  test('Test empty metadata', () => {
    const scoreSettings = parseSettings({});
    expect(scoreSettings).toStrictEqual({});
  });

  test('Test null metadata', () => {
    const scoreSettings = parseSettings(null);
    expect(scoreSettings).toStrictEqual({});
  });
});
