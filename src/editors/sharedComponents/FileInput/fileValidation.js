import { useState } from 'react';

const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

/**
 * Validates that a file does not exceed the maximum upload size.
 * Calls onSizeFail callback if the file exceeds the limit.
 *
 * @param {Object} params
 * @param {File}     params.file       - The File object to validate
 * @param {Function} params.onSizeFail - Callback invoked when the file exceeds the size limit
 * @param {number}   [params.maxBytes] - Optional custom max size in bytes (defaults to 200 MB)
 * @returns {boolean} true if file size is within the limit
 */
export const checkValidFileSize = ({ file, onSizeFail, maxBytes = MAX_UPLOAD_SIZE_BYTES }) => {
  if (file.size > maxBytes) {
    onSizeFail();
    return false;
  }
  return true;
};

/**
 * Validates that a file has an allowed MIME type or extension.
 *
 * @param {Object} params
 * @param {File}     params.file            - The File object to validate
 * @param {string[]} params.allowedTypes    - Array of allowed MIME types (e.g. ['audio/mpeg'])
 * @param {string[]} params.allowedExtensions - Array of allowed extensions (e.g. ['.mp3'])
 * @param {Function} params.onTypeFail      - Callback invoked when file type is invalid
 * @returns {boolean} true if file type is acceptable
 */
export const checkValidFileType = ({
  file, allowedTypes, allowedExtensions, onTypeFail,
}) => {
  if (allowedTypes && allowedTypes.includes(file.type)) {
    return true;
  }
  if (allowedExtensions) {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
    if (hasValidExtension) {
      return true;
    }
  }
  onTypeFail();
  return false;
};

/**
 * Extracts the display filename from a full asset path/URL.
 * Handles Open edX asset keys (containing '@') and regular URL paths (containing '/').
 *
 * @param {string} assetPath - The full asset path or URL
 * @returns {string} The extracted filename, or 'None' if no path is provided
 */
export const parseAssetName = (assetPath) => {
  if (!assetPath) {
    return 'None';
  }

  const lastAt = assetPath.lastIndexOf('@');
  if (lastAt !== -1) {
    return assetPath.slice(lastAt + 1);
  }

  const lastSlash = assetPath.lastIndexOf('/');
  if (lastSlash !== -1) {
    return assetPath.slice(lastSlash + 1);
  }

  return assetPath;
};

/**
 * React hook that provides a togglable error state with show/set/dismiss controls.
 * Replaces the repeated fileSizeError/fileTypeError pattern in upload widgets.
 *
 * @returns {{ show: boolean, set: () => void, dismiss: () => void }}
 */
export const useErrorToggle = () => {
  const [show, setShow] = useState(false);
  return {
    show,
    set: () => setShow(true),
    dismiss: () => setShow(false),
  };
};
