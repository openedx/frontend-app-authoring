import ReactStateSettingsParser from './ReactStateSettingsParser';
import {
  checklistWithFeebackHints,
} from './mockData/problemTestData';

describe('Test State to Settings Parser', () => {
  test('Test settings parsed from react state', () => {
    const settings = new ReactStateSettingsParser(checklistWithFeebackHints.state).getSettings();
    const { markdown, ...settingsPayload } = checklistWithFeebackHints.metadata;
    expect(settings).toStrictEqual(settingsPayload);
  });
});
