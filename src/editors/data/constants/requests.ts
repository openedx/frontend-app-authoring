import { StrictDict } from '../../utils';

export const RequestStates = StrictDict({
  inactive: 'inactive',
  pending: 'pending',
  completed: 'completed',
  failed: 'failed',
} as const);

export const RequestKeys = StrictDict({
  fetchVideos: 'fetchVideos',
  fetchBlock: 'fetchBlock',
  fetchImages: 'fetchImages',
  fetchUnit: 'fetchUnit',
  fetchStudioView: 'fetchStudioView',
  saveBlock: 'saveBlock',
  uploadVideo: 'uploadVideo',
  allowThumbnailUpload: 'allowThumbnailUpload',
  uploadThumbnail: 'uploadThumbnail',
  uploadTranscript: 'uploadTranscript',
  deleteTranscript: 'deleteTranscript',
  fetchCourseDetails: 'fetchCourseDetails',
  updateTranscriptLanguage: 'updateTranscriptLanguage',
  getTranscriptFile: 'getTranscriptFile',
  checkTranscriptsForImport: 'checkTranscriptsForImport',
  importTranscript: 'importTranscript',
  uploadAsset: 'uploadAsset',
  fetchAdvancedSettings: 'fetchAdvancedSettings',
  fetchVideoFeatures: 'fetchVideoFeatures',
} as const);
