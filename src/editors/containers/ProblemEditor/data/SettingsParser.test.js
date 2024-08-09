import { parseScoringSettings, parseSettings, parseShowAnswer } from './SettingsParser';
import {
  checklistWithFeebackHints,
  numericWithHints,
  textInputWithHints,
  singleSelectWithHints,
  negativeAttempts,
} from './mockData/problemTestData';

describe('Test Settings to State Parser', () => {
  const defaultSettings = { max_attempts: 1 };
  test('Test all fields populated', () => {
    const settings = parseSettings(checklistWithFeebackHints.metadata, defaultSettings);
    const { hints, ...settingsPayload } = checklistWithFeebackHints.state.settings;
    expect(settings).toStrictEqual(settingsPayload);
  });

  test('Test score settings', () => {
    const scoreSettings = parseScoringSettings(checklistWithFeebackHints.metadata, defaultSettings);
    expect(scoreSettings).toStrictEqual(checklistWithFeebackHints.state.settings.scoring);
  });

  test('Test score settings zero attempts', () => {
    const scoreSettings = parseScoringSettings(numericWithHints.metadata, defaultSettings);
    expect(scoreSettings).toStrictEqual(numericWithHints.state.settings.scoring);
  });

  test('Test score settings attempts missing with no default max_attempts', () => {
    const scoreSettings = parseScoringSettings(singleSelectWithHints.metadata, {});
    expect(scoreSettings.attempts).toStrictEqual(singleSelectWithHints.state.settings.scoring.attempts);
  });

  test('Test score settings attempts missing with default max_attempts', () => {
    const scoreSettings = parseScoringSettings(singleSelectWithHints.metadata, defaultSettings);
    expect(scoreSettings.attempts).toStrictEqual({ number: null, unlimited: false });
  });

  test('Test negative attempts in score', () => {
    const scoreSettings = parseScoringSettings(negativeAttempts.metadata, defaultSettings);
    expect(scoreSettings.attempts).toStrictEqual(negativeAttempts.state.settings.scoring.attempts);
  });

  test('Test score settings missing with no default', () => {
    const settings = parseSettings(singleSelectWithHints.metadata, {});
    expect(settings.scoring).toStrictEqual(singleSelectWithHints.state.settings.scoring);
  });

  test('Test score settings missing with default', () => {
    const settings = parseSettings(singleSelectWithHints.metadata, defaultSettings);
    expect(settings.scoring).toStrictEqual({ attempts: { number: null, unlimited: false } });
  });

  test('Test score settings missing with null default', () => {
    const settings = parseSettings(singleSelectWithHints.metadata, { max_attempts: null });
    expect(settings.scoring).toStrictEqual({ attempts: { number: null, unlimited: true } });
  });

  test('Test invalid randomization', () => {
    const settings = parseSettings(numericWithHints.metadata, defaultSettings);
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
    const scoreSettings = parseSettings({}, defaultSettings);
    expect(scoreSettings).toStrictEqual({});
  });

  test('Test null metadata', () => {
    const scoreSettings = parseSettings(null, defaultSettings);
    expect(scoreSettings).toStrictEqual({});
  });
});
