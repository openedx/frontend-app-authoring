import validateAdvancedSettingsData from './utils';

describe('validateAdvancedSettingsData', () => {
  it('should validate correctly formatted settings and return true', () => {
    const settingObj = {
      setting1: '{ "key": "value" }',
      setting2: '{ "key": "value" }',
    };
    const setErrorFieldsMock = jest.fn();
    const setEditedSettingsMock = jest.fn();
    const isValid = validateAdvancedSettingsData(settingObj, setErrorFieldsMock, setEditedSettingsMock);
    expect(isValid).toBe(true);
    expect(setErrorFieldsMock).toHaveBeenCalledTimes(1);
    expect(setEditedSettingsMock).toHaveBeenCalledTimes(0);
  });
  it('should validate incorrectly formatted settings and set error fields', () => {
    const settingObj = {
      setting1: '{ "key": "value" }',
      setting2: 'incorrectJSON',
      setting3: '{ "key": "value" }',
    };
    const setErrorFieldsMock = jest.fn();
    const setEditedSettingsMock = jest.fn();
    const isValid = validateAdvancedSettingsData(settingObj, setErrorFieldsMock, setEditedSettingsMock);
    expect(isValid).toBe(false);
    expect(setErrorFieldsMock).toHaveBeenCalledTimes(1);
    expect(setEditedSettingsMock).toHaveBeenCalledTimes(1);
  });
});
