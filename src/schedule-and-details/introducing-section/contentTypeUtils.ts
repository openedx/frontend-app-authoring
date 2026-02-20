/**
 * Utility functions for detecting content type and
 * determining appropriate editor type for TinyMCE editor
 */

// Define the supported editor types
export type EditorType = 'text' | 'html';

/**
 * Detects if content contains HTML tags
 * @param content - The content to analyze
 * @returns True if content contains HTML tags
 */
export const containsHtml = (content: string | null): boolean => {
  if (!content) {
    return false;
  }

  // Check for common HTML patterns
  const htmlPatterns: RegExp[] = [
    /<\/?[a-z][\s\S]*>/i, // HTML tags
    /&[a-z]+;/i, // HTML entities
    /&#\d+;/, // Numeric entities
  ];

  return htmlPatterns.some((pattern) => pattern.test(content));
};

/**
 * Determines the appropriate editor type based on content analysis
 * @param content - The content to analyze
 * @returns The recommended editor type ('text' or 'html')
 */
export const determineEditorType = (content: string | null): EditorType => {
  if (!content) {
    return 'text';
  }

  // If content contains HTML, use html editor for better HTML editing
  if (containsHtml(content)) {
    return 'html';
  }

  // For plain text content, use text editor
  return 'text';
};
