import JSZip from 'jszip';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import FILES_AND_UPLOAD_TYPE_FILTERS from './constant';

const urlToPromise = async (url, filename, contentType) => {
  const response = await getAuthenticatedHttpClient()
    .get(url);
  const data = await response.blob();
  const file = new File(data, filename, { type: contentType });
  return file;
};

export const createZipFile = ({ selectedFlatRows }) => {
  const zip = new JSZip();
  const img = zip.folder('images');
  const doc = zip.folder('documents');
  const code = zip.folder('code');
  const audio = zip.folder('audio');
  selectedFlatRows.forEach(row => {
    const {
      wrapperType,
      displayName,
      externalUrl,
      contentType,
    } = row.original;
    switch (wrapperType) {
    case 'document':
      doc.file(displayName, urlToPromise(externalUrl, displayName, contentType), { binary: true });
      break;
    case 'code':
      code.file(displayName, urlToPromise(externalUrl), { binary: true });
      break;
    case 'image':
      img.file(displayName, urlToPromise(externalUrl), { binary: true });
      break;
    case 'audio':
      audio.file(displayName, urlToPromise(externalUrl), { binary: true });
      break;
    default:
      zip.file(displayName, urlToPromise(externalUrl), { binary: true });
      break;
    }
  });
  // console.log('writtings');
};

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
