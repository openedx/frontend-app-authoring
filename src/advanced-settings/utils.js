/**
 * Validates advanced settings data by checking if the provided settings are correctly formatted JSON.
 * It performs validation on a given object of settings, detects incorrectly formatted settings,
 * and sets error fields accordingly using the setErrorFields function.
 *
 * @param {object} settingObj - The object containing the settings to validate.
 * @param {function} setErrorFields - The function to set error fields.
 * @returns {boolean} - `true` if the data is valid, otherwise `false`.
 */
export default function validateAdvancedSettingsData(settingObj, setErrorFields, setEditedSettings) {
  const fieldsWithErrors = [];

  const pushDataToErrorArray = (settingName) => {
    fieldsWithErrors.push({ key: settingName, message: 'Incorrectly formatted JSON' });
  };

  Object.entries(settingObj).forEach(([settingName, settingValue]) => {
    try {
      JSON.parse(settingValue);
    } catch (e) {
      let targetSettingValue = settingValue;
      const firstNonWhite = settingValue.substring(0, 1);
      const isValid = !['{', '[', "'"].includes(firstNonWhite);

      if (isValid) {
        try {
          targetSettingValue = `"${ targetSettingValue.trim() }"`;
          JSON.parse(targetSettingValue);
          setEditedSettings((prevEditedSettings) => ({
            ...prevEditedSettings,
            [settingName]: targetSettingValue,
          }));
        } catch (quotedE) { /* empty */ }
      }

      pushDataToErrorArray(settingName);
    }
  });

  setErrorFields((prevState) => {
    if (JSON.stringify(prevState) !== JSON.stringify(fieldsWithErrors)) {
      return fieldsWithErrors;
    }
    return prevState;
  });

  return fieldsWithErrors.length === 0;
}
