import ReactStateSettingsParser from './ReactStateSettingsParser';
import {
  checklistWithFeebackHints,
} from './mockData/problemTestData';

describe('Test State to Settings Parser', () => {
  test('Test settings parsed from react state', () => {
    const settings = new ReactStateSettingsParser({ problem: checklistWithFeebackHints.state }).getSettings();
    const { markdown, ...settingsPayload } = checklistWithFeebackHints.metadata;
    expect(settings).toStrictEqual(settingsPayload);
  });
  test('Test settings parsed from raw olx', () => {
    const settings = new ReactStateSettingsParser({
      problem: checklistWithFeebackHints.state,
      rawOLX: '<problem showanswer="always">text</problem>',
    }).parseRawOlxSettings();
    const { markdown, ...settingsPayload } = checklistWithFeebackHints.metadata;
    expect(settings).toStrictEqual({ ...settingsPayload, showanswer: 'always' });
  });
});
