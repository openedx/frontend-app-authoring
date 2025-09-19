// Centralized UI preference utility
// This provides a consistent way to check UI preference across all components

let currentUIPreference = null;

/**
 * Get the current UI preference
 * @returns {boolean} true if new UI should be used, false for old UI
 */
export const getCurrentUIPreference = () => {
  return currentUIPreference;
};

/**
 * Set the current UI preference
 * @param {boolean} useNewUI - true for new UI, false for old UI
 */
export const setCurrentUIPreference = (useNewUI) => {
  currentUIPreference = useNewUI;
  console.log('UI preference updated globally:', useNewUI);
};

/**
 * Check if old UI is being used
 * @returns {boolean} true if old UI, false if new UI
 */
export const isOldUI = () => {
  return currentUIPreference === false;
};

/**
 * Check if new UI is being used
 * @returns {boolean} true if new UI, false if old UI
 */
export const isNewUI = () => {
  return currentUIPreference === true;
};
