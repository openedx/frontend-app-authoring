import { StrictDict } from '../../utils';

export const RequestStates = StrictDict({
  inactive: 'inactive',
  pending: 'pending',
  completed: 'completed',
  failed: 'failed',
});

export const RequestKeys = StrictDict({
  fetchAssets: 'fetchAssets',
  fetchBlock: 'fetchBlock',
  fetchImages: 'fetchImages',
  fetchUnit: 'fetchUnit',
  fetchStudioView: 'fetchStudioView',
  saveBlock: 'saveBlock',
  uploadAsset: 'uploadAsset',
  allowThumbnailUpload: 'allowThumbnailUpload',
  uploadThumbnail: 'uploadThumbnail',
  uploadTranscript: 'uploadTranscript',
  deleteTranscript: 'deleteTranscript',
  fetchCourseDetails: 'fetchCourseDetails',
  updateTranscriptLanguage: 'updateTranscriptLanguage',
  getTranscriptFile: 'getTranscriptFile',
  checkTranscriptsForImport: 'checkTranscriptsForImport',
  importTranscript: 'importTranscript',
  uploadImage: 'uploadImage',
  fetchAdvancedSettings: 'fetchAdvancedSettings',
  fetchVideoFeatures: 'fetchVideoFeatures',
});
