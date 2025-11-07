/**
 * Utility functions for detecting content type and
 * determining appropriate editor type for TinyMCE editor
 */

/**
 * Detects if content contains HTML tags
 * @param {string} content - The content to analyze
 * @returns {boolean} - True if content contains HTML tags
 */
export const containsHtml = (content) => {
  if (!content || typeof content !== 'string') {
    return false;
  }

  // Check for common HTML patterns
  const htmlPatterns = [
    /<\/?[a-z][\s\S]*>/i, // HTML tags
    /&[a-z]+;/i, // HTML entities
    /&#\d+;/, // Numeric entities
  ];

  return htmlPatterns.some(pattern => pattern.test(content));
};

/**
 * Determines the appropriate editor type based on content analysis
 * @param {string} content - The content to analyze
 * @returns {string} - The recommended editor type ('text' or 'html')
 */
export const determineEditorType = (content) => {
  if (!content || typeof content !== 'string') {
    return 'text';
  }

  // If content contains HTML, use html editor for better HTML editing
  if (containsHtml(content)) {
    return 'html';
  }

  // For plain text content, use text editor
  return 'text';
};
