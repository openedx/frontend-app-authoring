import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

/**
 * Get the current UI preference from the API
 * @returns {Promise<boolean>} true if new UI should be used, false for old UI
 */
export const getUIPreference = async () => {
  try {
    const response = await getAuthenticatedHttpClient().get(
      `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`,
    );

    if (response.status === 200 && response.data) {
      return response.data.use_new_ui === true;
    }

    // Default to new UI if API fails or data is invalid
    console.warn('Failed to get UI preference from API, defaulting to new UI');
    return true;
  } catch (error) {
    console.error('Error fetching UI preference:', error);
    // Default to new UI on error
    return true;
  }
};

/**
 * Set the UI preference via API
 * @param {boolean} useNewUI - true for new UI, false for old UI
 * @returns {Promise<boolean>} true if successful, false otherwise
 */
export const setUIPreference = async (useNewUI) => {
  try {
    const response = await getAuthenticatedHttpClient().post(
      `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/set_ui_preference/`,
      {
        use_new_ui: useNewUI,
      },
    );

    if (response.status === 200 && response.data?.success) {
      return true;
    }

    console.error('Failed to set UI preference:', response.data);
    return false;
  } catch (error) {
    console.error('Error setting UI preference:', error);
    return false;
  }
};