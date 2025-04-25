/* eslint-disable no-console */
import axios from 'axios';
import { getDynamicStyles } from './injectDynamicStyles';

export async function fetchTemplateData() {
  try {
    const response = await axios.get('http://localhost:5000/templateData', {
      headers: { 'Cache-Control': 'no-store' }, // Disable caching
    });
    console.log('Fetched Theme Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching theme data:', error);
    return null;
  }
}

export async function loadThemeStyles() {
  const templateData = await fetchTemplateData();
  return getDynamicStyles(templateData?.themeSettings);
}

export async function getContentData() {
  const templateData = await fetchTemplateData();
  return templateData?.content || null;
}
