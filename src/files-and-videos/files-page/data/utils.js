import {
  InsertDriveFile,
  Terminal,
  AudioFile,
} from '@openedx/paragon/icons';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import FILES_AND_UPLOAD_TYPE_FILTERS from '../../generic/constants';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const updateFileValues = (files) => {
  const updatedFiles = [];
  files.forEach(file => {
    let wrapperType = 'other';
    if (FILES_AND_UPLOAD_TYPE_FILTERS.images.includes(file.contentType)) {
      wrapperType = 'image';
    } else if (FILES_AND_UPLOAD_TYPE_FILTERS.documents.includes(file.contentType)) {
      wrapperType = 'document';
    } else if (FILES_AND_UPLOAD_TYPE_FILTERS.code.includes(file.contentType)) {
      wrapperType = 'code';
    } else if (FILES_AND_UPLOAD_TYPE_FILTERS.audio.includes(file.contentType)) {
      wrapperType = 'audio';
    }

    const { dateAdded, locked, usageLocations } = file;
    const utcDateString = dateAdded.replace(/\bat\b/g, '');
    const utcDateTime = new Date(utcDateString).getTime();
    const lockStatus = locked ? 'locked' : 'public';
    const activeStatus = usageLocations?.length > 0 ? 'active' : 'inactive';

    updatedFiles.push({
      ...file,
      wrapperType,
      lockStatus,
      activeStatus,
      dateAdded: utcDateTime,
    });
  });

  return updatedFiles;
};

/**
 * Whether a file has an image preview (as opposed to a generic icon): either Studio generated a
 * thumbnail for it, or it is itself an image we can show directly (e.g. when thumbnail generation
 * failed, or for files stored in the openedx_content backend, which never has thumbnails).
 */
// Image types that browsers generally can't display (TIFF), or that look poor scaled up (ICO). These
// are only previewed if Studio generated a thumbnail for them; otherwise they get the default icon.
const NON_PREVIEWABLE_IMAGE_TYPES = [
  'image/tiff',
  'image/tif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

const canShowFullImage = ({ wrapperType, contentType, externalUrl }) => (
  wrapperType === 'image' && !!externalUrl && !NON_PREVIEWABLE_IMAGE_TYPES.includes(contentType)
);

export const hasImagePreview = ({
  thumbnail,
  wrapperType,
  contentType,
  externalUrl,
}) => (
  !!thumbnail || canShowFullImage({ wrapperType, contentType, externalUrl })
);

/**
 * Returns the preview for a file: a URL string if `hasImagePreview()` is true, otherwise a
 * Paragon icon component for its wrapperType.
 */
export const getSrc = ({
  thumbnail,
  wrapperType,
  contentType,
  externalUrl,
}) => {
  if (thumbnail) {
    // `thumbnail` is a root-relative Studio path to a small generated JPEG.
    return `${getConfig().STUDIO_BASE_URL}${thumbnail}`;
  }
  if (canShowFullImage({ wrapperType, contentType, externalUrl })) {
    // No thumbnail, so fall back to the full-size image.
    return externalUrl;
  }
  switch (wrapperType) {
    case 'document':
      return InsertDriveFile;
    case 'code':
      return Terminal;
    case 'audio':
      return AudioFile;
    default:
      return InsertDriveFile;
  }
};

export const getUploadConflicts = (filesToUpload, assets) => {
  const filesFound = assets.map(item => item.displayName);
  const conflicts = {};
  const newFiles = [];
  filesToUpload.forEach(file => {
    if (filesFound.includes(file.name)) {
      conflicts[file.name] = file;
    } else {
      newFiles.push(file);
    }
  });
  return [conflicts, newFiles];
};
