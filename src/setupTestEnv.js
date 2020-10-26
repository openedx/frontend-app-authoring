// setupTest.js runs before Jest injects its environment. This file runs afterward.

const trueType = (variable) => {
  // typeof is almost useless. Arrays are 'objects'. NaN is a 'number'! NULL IS AN 'object'! WHY?!?
  if (Array.isArray(variable)) {
    return 'array';
  }
  if (variable === null) {
    return 'null';
  }
  if (Number.isNaN(variable)) {
    return 'NaN';
  }
  return typeof variable;
};

expect.extend({
  i18nDefinedIn(key, messages) {
    if (typeof messages !== 'object') {
      return {
        message: () => `expected i18n messages variable to be an object. It was ${typeof messages}`,
        pass: false,
      };
    }
    const entryType = trueType(messages[key]);
    if (entryType !== 'object') {
      return {
        message: () => `expected i18n key ${key} to be an object. It was: ${entryType}`,
        pass: false,
      };
    }
    const missingItems = [];
    const blankItems = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const attr of ['id', 'defaultMessage', 'description']) {
      const itemType = trueType(messages[key][attr]);
      if (itemType !== 'string') {
        missingItems.push([attr, itemType]);
      } else if (messages[key][attr].length === 0) {
        blankItems.push(attr);
      }
    }
    if (missingItems.length || blankItems.length) {
      let message = `Invalid message definition for ${key}.`;
      // eslint-disable-next-line no-restricted-syntax
      for (const [attr, type] of missingItems) {
        message += ` '${attr}' was ${type} (should be string).`;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const attr of blankItems) {
        message += ` '${attr}' is blank.`;
      }
      return {
        message: () => message,
        pass: false,
      };
    }
    if (messages[key].id !== key) {
      return {
        message: () => `expected i18n key "${key}" to have the same ID, but it had "${messages[key].id}" instead!`,
        pass: false,
      };
    }
    return {
      message: () => `expected i18n "${key}" to be valid.`,
      pass: true,
    };
  },
});
