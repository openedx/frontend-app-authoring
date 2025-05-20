/**
 * Utility functions for image validation
 */

/**
 * Validates if a file is a valid image type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Whether the file is valid
 */
export const isValidImageType = (file, allowedTypes = ['image/jpeg', 'image/png']) => {
    return allowedTypes.includes(file.type);
};

/**
 * Validates if a file is a valid video type
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is valid
 */
export const isValidVideoType = (file) => {
    return file.type.startsWith('video/');
};

/**
 * Validates an image file and returns any error messages
 * @param {File} file - The file to validate
 * @param {string} field - The field name (e.g. 'cardImage', 'bannerImage')
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {string|null} - Error message if invalid, null if valid
 */
export const validateImage = (file, field, allowedTypes = ['image/jpeg', 'image/png']) => {
    if (!file) return null;

    if (field === 'introVideo') {
        if (!isValidVideoType(file)) {
            return 'Please upload a valid video file (MP4 or WebM)';
        }
    } else if (field === 'cardImage' || field === 'bannerImage') {
        if (!isValidImageType(file, allowedTypes)) {
            return 'Only JPEG or PNG images are supported.';
        }
    }

    return null;
};

/**
 * Validates a video file and returns any error messages
 * @param {File} file - The file to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
export const validateVideo = (file) => {
    if (!file) return null;

    if (!isValidVideoType(file)) {
        return 'Please upload a valid video file (MP4 or WebM)';
    }

    return null;
}; 