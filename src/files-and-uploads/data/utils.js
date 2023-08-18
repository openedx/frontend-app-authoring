import { InsertDriveFile, Terminal, AudioFile } from '@edx/paragon/icons';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import FILES_AND_UPLOAD_TYPE_FILTERS from './constant';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getWrapperType = (assets) => {
  const assetsWithWraperType = [];
  assets.forEach(asset => {
    if (FILES_AND_UPLOAD_TYPE_FILTERS.images.includes(asset.contentType)) {
      assetsWithWraperType.push({ wrapperType: 'image', ...asset });
    } else if (FILES_AND_UPLOAD_TYPE_FILTERS.documents.includes(asset.contentType)) {
      assetsWithWraperType.push({ wrapperType: 'document', ...asset });
    } else if (FILES_AND_UPLOAD_TYPE_FILTERS.code.includes(asset.contentType)) {
      assetsWithWraperType.push({ wrapperType: 'code', ...asset });
    } else if (FILES_AND_UPLOAD_TYPE_FILTERS.audio.includes(asset.contentType)) {
      assetsWithWraperType.push({ wrapperType: 'audio', ...asset });
    } else {
      assetsWithWraperType.push({ wrapperType: 'other', ...asset });
    }
  });
  return assetsWithWraperType;
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

export const getFileSizeToClosestByte = (fileSize, numberOfDivides = 0) => {
  if (fileSize > 1000) {
    const updatedSize = fileSize / 1000;
    const incrementNumberOfDivides = numberOfDivides + 1;
    return getFileSizeToClosestByte(updatedSize, incrementNumberOfDivides);
  }
  const fileSizeFixedDecimal = Number.parseFloat(fileSize).toFixed(2);
  switch (numberOfDivides) {
  case 1:
    return `${fileSizeFixedDecimal} KB`;
  case 2:
    return `${fileSizeFixedDecimal} MB`;
  default:
    return `${fileSizeFixedDecimal} B`;
  }
};
