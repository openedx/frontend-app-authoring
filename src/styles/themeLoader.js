import theme from './theme.json';

export const applyTheme = () => {
  try {
    // Validate that theme is an object
    if (!theme || typeof theme !== 'object') {
      throw new Error('Invalid theme data: theme.json must contain a valid object');
    }

    // Apply theme variables to :root
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
    });
    console.log('Theme applied successfully from theme.json');
  } catch (error) {
    console.error('Error applying theme:', error.message);
    console.error('Full error:', error);
    // Apply fallback theme if error occurs
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