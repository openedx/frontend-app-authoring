import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

export const applyTheme = async () => {
  try {
    const response = await getAuthenticatedHttpClient().get(
      `${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`
    );
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch theme config');
    }

    const themeColors = response.data.theme_colors;

    
    if (!themeColors || typeof themeColors !== 'object') {
      throw new Error('Invalid theme_colors in API response');
    }

    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
    });

    console.log('Theme applied successfully from API:', themeColors);
  } catch (error) {
    console.error('Error applying theme from API:', error.message);

    const fallbackTheme = {
      primary: "#2B2399",
      primary_alt: "#3C32B5",
      primary_hover: "#E2E1F9",
      primary_active: "#1F1A7D",
      primary_light: "#E2E1F9",
      secondary: "#7A8AFF",
      secondary_alt: "#5C6EF0",
      secondary_hover: "#ECEEFF",
      secondary_active: "#4A5BD1",
      secondary_light: "#ECEEFF",
    };

    const root = document.documentElement;
    Object.entries(fallbackTheme).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
    });
    console.log('Fallback theme applied');
  }
};