/* eslint-disable no-console */
import { getDynamicStyles } from './injectDynamicStyles';

export async function fetchTemplateData() {
  try {
    const response = await fetch('/titan.json');
    // console.log('Fetched Theme Data:', response.data);
    const data = await response.json();
    console.log('Parsed Theme Data:', data);
    return data.templateData;
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
