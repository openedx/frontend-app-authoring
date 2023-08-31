import { InsertDriveFile, Terminal, AudioFile } from '@edx/paragon/icons';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import FILES_AND_UPLOAD_TYPE_FILTERS from './constant';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getDownloadZipFolder = async (selectedRows, courseId, onError) => {
  if (selectedRows.length > 1) {
    const zip = new JSZip();
    const date = new Date().toString();
    const folder = zip.folder(`${courseId}-assets-${date}`);
    const assetNames = [];
    const assetFetcher = await Promise.all(
      selectedRows.map(async (row) => {
        const asset = row.original;
        assetNames.push(asset.displayName);
        try {
          const res = await fetch(`${getConfig().STUDIO_BASE_URL}/${asset.id}`);
          if (!res.ok) {
            throw new Error();
          }
          return res.blob();
        } catch (error) {
          onError({ message: `Failed to download ${asset.displayName}` });
          return null;
        }
      }),
    );
    const definedAssets = assetFetcher.filter(asset => asset !== null);
    if (definedAssets.length > 0) {
      assetFetcher.forEach((assetBlob, index) => {
        folder.file(assetNames[index], assetBlob, { blob: true });
      });
      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, `${courseId}-assets-${date}.zip`);
      });
    }
  } else {
    const asset = selectedRows[0].original;
    try {
      saveAs(`${getConfig().STUDIO_BASE_URL}/${asset.id}`, asset.displayName);
    } catch (error) {
      onError({ message: `Failed to download ${asset.displayName}` });
    }
  }
};

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

    const { dateAdded } = file;
    const utcDateString = dateAdded.replace(/\bat\b/g, '');
    const utcDateTime = new Date(utcDateString).toString();

    updatedFiles.push({ ...file, wrapperType, dateAdded: utcDateTime });
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
