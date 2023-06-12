/**
 * Validates advanced settings data by checking if the provided settings are correctly formatted JSON.
 * It performs validation on a given object of settings, detects incorrectly formatted settings,
 * and sets error fields accordingly using the setErrorFields function.
 *
 * @param {object} settingObj - The object containing the settings to validate.
 * @param {function} setErrorFields - The function to set error fields.
 * @returns {boolean} - `true` if the data is valid, otherwise `false`.
 */
export default function validateAdvancedSettingsData(settingObj, setErrorFields) {
  const fieldsWithErrors = [];

  const pushDataToErrorArray = (settingName) => {
    fieldsWithErrors.push({ key: settingName, message: 'Incorrectly formatted JSON' });
  };

  const bracketsValidation = (value) => (/[{[\]}]/.test(value));

  Object.entries(settingObj).forEach(([settingName, settingValue]) => {
    const isArrayOrObject = (settingValue.startsWith('[') && settingValue.endsWith(']'))
        || (settingValue.startsWith('{') && settingValue.endsWith('}'));

    if (typeof settingValue === 'string') {
      if (isArrayOrObject) {
        try {
          JSON.parse(settingValue);
        } catch (err) {
          pushDataToErrorArray(settingName);
        }
      } else if (bracketsValidation(settingValue)) {
        pushDataToErrorArray(settingName);
      }
    }
  });

  setErrorFields(prevState => {
    if (JSON.stringify(prevState) !== JSON.stringify(fieldsWithErrors)) {
      return fieldsWithErrors;
    }
    return prevState;
  });

  return fieldsWithErrors.length === 0;
}
