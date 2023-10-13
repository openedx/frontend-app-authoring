import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { isArray, isEmpty } from 'lodash';
import {
  ASPECT_RATIO,
  ASPECT_RATIO_ERROR_MARGIN,
  MAX_HEIGHT,
  MAX_WIDTH,
  MIN_HEIGHT,
  MIN_WIDTH,
} from './constants';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const updateFileValues = (files) => {
  const updatedFiles = [];
  files.forEach(file => {
    const {
      edxVideoId,
      clientVideoId,
      created,
      courseVideoImageUrl,
    } = file;
    const wrapperType = 'video';

    let thumbnail = courseVideoImageUrl;
    if (thumbnail.startsWith('/')) {
      thumbnail = `${getConfig().STUDIO_BASE_URL}${thumbnail}`;
    }

    updatedFiles.push({
      ...file,
      displayName: clientVideoId,
      id: edxVideoId,
      wrapperType,
      dateAdded: created.toString(),
      usageLocations: [],
      fileSize: null,
      thumbnail,
    });
  });

  return updatedFiles;
};

export const getFormattedDuration = (value) => {
  if (!value || typeof value !== 'number' || value <= 0) {
    return '00:00:00';
  }
  const seconds = Math.floor(value % 60);
  const minutes = Math.floor((value / 60) % 60);
  const hours = Math.floor((value / 360) % 60);
  const zeroPad = (num) => String(num).padStart(2, '0');
  return [hours, minutes, seconds].map(zeroPad).join(':');
};

export const getLanguages = (availableLanguages) => {
  const languages = {};
  availableLanguages?.forEach(language => {
    const { languageCode, languageText } = language;
    languages[languageCode] = languageText;
  });
  return languages;
};

export const sortFiles = (files, sortType) => {
  const [sort, direction] = sortType.split(',');
  let sortedFiles;
  if (sort === 'displayName') {
    sortedFiles = files.sort((f1, f2) => {
      const lowerCaseF1 = f1[sort].toLowerCase();
      const lowerCaseF2 = f2[sort].toLowerCase();
      if (lowerCaseF1 < lowerCaseF2) {
        return 1;
      }
      if (lowerCaseF1 > lowerCaseF2) {
        return -1;
      }
      return 0;
    });
  } else {
    sortedFiles = files.sort((f1, f2) => {
      if (f1[sort] < f2[sort]) {
        return 1;
      }
      if (f1[sort] > f2[sort]) {
        return -1;
      }
      return 0;
    });
  }
  const sortedIds = sortedFiles.map(file => file.id);
  if (direction === 'asc') {
    return sortedIds.reverse();
  }
  return sortedIds;
};

export const getSupportedFormats = (supportedFileFormats) => {
  if (isEmpty(supportedFileFormats)) {
    return null;
  }
  if (isArray(supportedFileFormats)) {
    return supportedFileFormats;
  }
  const supportedFormats = [];
  Object.entries(supportedFileFormats).forEach(([key, value]) => {
    let format;
    if (isArray(value)) {
      value.forEach(val => {
        format = key.replace('*', val.substring(1));
        supportedFormats.push(format);
      });
    } else {
      format = key.replace('*', value?.substring(1));
      supportedFormats.push(format);
    }
  });
  return supportedFormats;
};

/** resampledFile({ canvasUrl, filename, mimeType })
 * resampledFile takes a canvasUrl, filename, and a valid mimeType. The
 * canvasUrl is parsed and written to an 8-bit array of unsigned integers. The
 * new array is saved to  a new file with the same filename as the original image.
 * @param {string} canvasUrl - string of base64 URL for new image canvas
 * @param {string} filename - string of the original image's filename
 * @param {string} mimeType - string of mimeType for the canvas
 * @return {File} new File object
 */
export const createResampledFile = ({ canvasUrl, filename, mimeType }) => {
  const arr = canvasUrl.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
};

/** resampleImage({ image, filename })
 * resampledImage takes a canvasUrl, filename, and a valid mimeType. The
 * canvasUrl is parsed and written to an 8-bit array of unsigned integers. The
 * new array is saved to  a new file with the same filename as the original image.
 * @param {File} canvasUrl - string of base64 URL for new image canvas
 * @param {string} filename - string of the image's filename
 * @return {array} array containing the base64 URL for the resampled image and the file containing the resampled image
 */
export const resampleImage = ({ image, filename }) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Determine new dimensions for image
  if (image.naturalWidth > MAX_WIDTH) {
    // Set dimensions to the maximum size
    canvas.width = MAX_WIDTH;
    canvas.height = MAX_HEIGHT;
  } else if (image.naturalWidth < MIN_WIDTH) {
    // Set dimensions to the minimum size
    canvas.width = MIN_WIDTH;
    canvas.height = MIN_HEIGHT;
  } else {
    // Set dimensions to the closest 16:9 ratio
    const heightRatio = 9 / 16;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalWidth * heightRatio;
  }
  const cropLeft = (image.naturalWidth - canvas.width) / 2;
  const cropTop = (image.naturalHeight - canvas.height) / 2;

  ctx.drawImage(image, cropLeft, cropTop, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

  const resampledFile = createResampledFile({ canvasUrl: canvas.toDataURL(), filename, mimeType: 'image/png' });
  return resampledFile;
};

const hasValidDimensions = (image) => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const imageAspectRatio = Math.abs(width / height) - ASPECT_RATIO;

  if (width < MIN_HEIGHT || height < MIN_HEIGHT) {
    return false;
  }
  if (imageAspectRatio >= ASPECT_RATIO_ERROR_MARGIN) {
    return false;
  }
  return true;
};

export const resampleFile = ({
  file,
  dispatch,
  videoId,
  courseId,
  addVideoThumbnail,
}) => {
  const reader = new FileReader();
  const image = new Image();
  reader.onload = () => {
    image.src = reader.result;
    image.onload = () => {
      if (!hasValidDimensions(image)) {
        const resampledFile = resampleImage({ image, filename: file.name });
        dispatch(addVideoThumbnail({ courseId, videoId, file: resampledFile }));
      } else {
        dispatch(addVideoThumbnail({ courseId, videoId, file }));
      }
    };
  };
  reader.readAsDataURL(file);
};
