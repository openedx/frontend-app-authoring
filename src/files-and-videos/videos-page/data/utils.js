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

export const updateFileValues = (files, isNewFile) => {
  const updatedFiles = [];
  files.forEach(file => {
    const {
      edxVideoId,
      clientVideoId,
      created,
      courseVideoImageUrl,
      transcripts,
    } = file;

    let wrapperType;
    if (clientVideoId.endsWith('.mov')) {
      wrapperType = 'MOV';
    } else if (clientVideoId.endsWith('.mp4')) {
      wrapperType = 'MP4';
    } else {
      wrapperType = 'Unknown';
    }

    let thumbnail = courseVideoImageUrl;
    if (thumbnail && thumbnail.startsWith('/')) {
      thumbnail = `${getConfig().STUDIO_BASE_URL}${thumbnail}`;
    }
    const transcriptStatus = transcripts?.length > 0 ? 'transcribed' : 'notTranscribed';

    updatedFiles.push({
      ...file,
      displayName: clientVideoId,
      id: edxVideoId,
      wrapperType,
      dateAdded: created.toString(),
      usageLocations: isNewFile ? [] : null,
      thumbnail,
      transcriptStatus,
      activeStatus: 'inactive',
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

export const getSortedTranscripts = (languages, transcripts) => {
  const transcriptDisplayNames = [];
  transcripts.forEach(transcript => {
    const displayName = languages[transcript];
    transcriptDisplayNames.push(displayName);
  });

  const sortedTranscripts = transcriptDisplayNames.sort();
  const sortedTranscriptCodes = [];
  sortedTranscripts.forEach(transcript => {
    Object.entries(languages).forEach(([key, value]) => {
      if (value === transcript) {
        sortedTranscriptCodes.push(key);
      }
    });
  });

  return sortedTranscriptCodes;
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
        if (val === '.mov') {
          format = key.replace('*', 'quicktime');
        } else {
          format = key.replace('*', val.substring(1));
        }
        supportedFormats.push(format);
      });
    } else {
      if (value === '.mov') {
        format = key.replace('*', 'quicktime');
      } else {
        format = key.replace('*', value.substring(1));
      }
      supportedFormats.push(format);
    }
  });
  return supportedFormats;
};

/** createResampledFile({ canvasUrl, filename, mimeType })
 * createResampledFile takes a canvasUrl, filename, and a valid mimeType. The
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

export const hasValidDimensions = ({ width, height }) => {
  const imageAspectRatio = Math.abs((width / height) - ASPECT_RATIO);

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
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
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!hasValidDimensions({ width, height })) {
        const resampledFile = resampleImage({ image, filename: file.name });
        dispatch(addVideoThumbnail({ courseId, videoId, file: resampledFile }));
      } else {
        dispatch(addVideoThumbnail({ courseId, videoId, file }));
      }
    };
  };
  reader.readAsDataURL(file);
};

export const getLanguageOptions = (keys, languages) => {
  const options = {};
  if (keys) {
    keys.forEach(key => {
      options[key] = languages[key];
    });
  }
  return options;
};

export const getFidelityOptions = (fidelities) => {
  const options = {};
  Object.entries(fidelities).forEach(([key, value]) => {
    const { display_name: displayName } = value;
    options[key] = displayName;
  });
  return options;
};

export const checkCredentials = (transcriptCredentials) => {
  const cieloHasCredentials = transcriptCredentials.cielo24;
  const threePlayHasCredentials = transcriptCredentials['3PlayMedia'];
  return [cieloHasCredentials, threePlayHasCredentials];
};

export const checkTranscriptionPlans = (transcriptionPlans) => {
  let cieloIsValid = !isEmpty(transcriptionPlans.Cielo24);
  let threePlayIsValid = !isEmpty(transcriptionPlans['3PlayMedia']);

  if (cieloIsValid) {
    const { fidelity, turnaround } = transcriptionPlans.Cielo24;
    cieloIsValid = !isEmpty(fidelity) && !isEmpty(turnaround);
  }

  if (threePlayIsValid) {
    const { languages, turnaround, translations } = transcriptionPlans['3PlayMedia'];
    threePlayIsValid = !isEmpty(turnaround) && !isEmpty(languages) && !isEmpty(translations);
  }

  return [cieloIsValid, threePlayIsValid];
};

export const validateForm = (cieloHasCredentials, threePlayHasCredentials, provider, data) => {
  const {
    apiKey,
    apiSecretKey,
    username,
    cielo24Fidelity,
    cielo24Turnaround,
    preferredLanguages,
    threePlayTurnaround,
    videoSourceLanguage,
  } = data;
  switch (provider) {
    case 'Cielo24':
      if (cieloHasCredentials) {
        return !isEmpty(cielo24Fidelity) && !isEmpty(cielo24Turnaround)
        && !isEmpty(preferredLanguages) && !isEmpty(videoSourceLanguage);
      }
      return !isEmpty(apiKey) && !isEmpty(username);
    case '3PlayMedia':
      if (threePlayHasCredentials) {
        return !isEmpty(threePlayTurnaround) && !isEmpty(preferredLanguages) && !isEmpty(videoSourceLanguage);
      }
      return !isEmpty(apiKey) && !isEmpty(apiSecretKey);
    case 'order':
      return true;
    default:
      break;
  }
  return false;
};
