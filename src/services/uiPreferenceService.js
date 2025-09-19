import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

// Simple cache to prevent multiple API calls
let cachedUIPreference = null;
let isInitialized = false;

/**
 * Get the current UI preference from the API
 * @returns {Promise<boolean>} true if new UI should be used, false for old UI
 */
export const getUIPreference = async () => {
  // Return cached value if already initialized
  if (isInitialized && cachedUIPreference !== null) {
    console.log('Returning cached UI preference:', cachedUIPreference);
    return cachedUIPreference;
  }

  try {
    console.log('Fetching UI preference from API...');
    
    const response = await getAuthenticatedHttpClient().get(
      `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`,
    );

    if (response.status === 200 && response.data) {
      const useNewUI = response.data.use_new_ui === true;
      cachedUIPreference = useNewUI;
      isInitialized = true;
      
      // Update localStorage for plugin config compatibility
      localStorage.setItem('oldUI', useNewUI ? 'false' : 'true');
      
      console.log('API returned use_new_ui:', useNewUI, 'Updated localStorage to:', useNewUI ? 'false' : 'true');
      return useNewUI;
    }

    // Default to old UI if API fails
    console.warn('API failed, defaulting to old UI');
    cachedUIPreference = false;
    isInitialized = true;
    localStorage.setItem('oldUI', 'true');
    return false;
  } catch (error) {
    console.error('Error fetching UI preference:', error);
    // Default to old UI on error
    cachedUIPreference = false;
    isInitialized = true;
    localStorage.setItem('oldUI', 'true');
    return false;
  }
};

/**
 * Set the UI preference via API
 * @param {boolean} useNewUI - true for new UI, false for old UI
 * @returns {Promise<boolean>} true if successful, false otherwise
 */
export const setUIPreference = async (useNewUI) => {
  try {
    console.log('Setting UI preference via API:', useNewUI);
    
    const response = await getAuthenticatedHttpClient().post(
      `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/set_ui_preference/`,
      {
        use_new_ui: useNewUI,
      },
    );

    if (response.status === 200 && response.data?.success) {
      // Update cache and localStorage
      cachedUIPreference = useNewUI;
      localStorage.setItem('oldUI', useNewUI ? 'false' : 'true');
      
      console.log('UI preference updated successfully:', useNewUI, 'localStorage set to:', useNewUI ? 'false' : 'true');
      return true;
    }

    console.error('Failed to set UI preference:', response.data);
    return false;
  } catch (error) {
    console.error('Error setting UI preference:', error);
    return false;
  }
};

/**
 * Clear the UI preference cache (useful for testing or forced refresh)
 */
export const clearUIPreferenceCache = () => {
  cachedUIPreference = null;
  isInitialized = false;
  console.log('UI preference cache cleared');
};