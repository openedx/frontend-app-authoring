import {
  InsertDriveFile,
  Terminal,
  AudioFile,
} from '@edx/paragon/icons';
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
    const utcDateTime = new Date(utcDateString).toString();
    const lockStatus = locked ? 'locked' : 'public';
    const activeStatus = usageLocations?.length > 0 ? 'active' : 'inactive';

    updatedFiles.push({
      ...file,
      wrapperType,
      lockStatus,
      activeStatus,
      dateAdded: utcDateTime,
      usageLocations: [],
    });
  });

  return updatedFiles;
};

export const getSrc = ({ thumbnail, wrapperType, externalUrl }) => {
  if (thumbnail) {
    return externalUrl || `${getConfig().STUDIO_BASE_URL}${thumbnail}`;
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
