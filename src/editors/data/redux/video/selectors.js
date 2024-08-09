import { createSelector } from 'reselect';

import { keyStore } from '../../../utils';
import { videoTranscriptLanguages } from '../../constants/video';

import { initialState } from './reducer';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './selectors';
import * as AppSelectors from '../app/selectors';
import { downloadVideoTranscriptURL, downloadVideoHandoutUrl, mediaTranscriptURL } from '../../services/cms/urls';

const stateKeys = keyStore(initialState);

export const video = (state) => state.video;

export const simpleSelectors = [
  stateKeys.videoSource,
  stateKeys.videoId,
  stateKeys.fallbackVideos,
  stateKeys.allowVideoDownloads,
  stateKeys.videoSharingEnabledForCourse,
  stateKeys.videoSharingLearnMoreLink,
  stateKeys.videoSharingEnabledForAll,
  stateKeys.allowVideoSharing,
  stateKeys.thumbnail,
  stateKeys.transcripts,
  stateKeys.selectedVideoTranscriptUrls,
  stateKeys.allowTranscriptDownloads,
  stateKeys.duration,
  stateKeys.showTranscriptByDefault,
  stateKeys.handout,
  stateKeys.licenseType,
  stateKeys.licenseDetails,
  stateKeys.courseLicenseType,
  stateKeys.courseLicenseDetails,
  stateKeys.allowThumbnailUpload,
  stateKeys.allowTranscriptImport,
].reduce((obj, key) => ({ ...obj, [key]: state => state.video[key] }), {});

export const openLanguages = createSelector(
  [module.simpleSelectors.transcripts],
  (transcripts) => {
    if (!transcripts) {
      return videoTranscriptLanguages;
    }
    const open = Object.keys(videoTranscriptLanguages).filter(
      (lang) => !transcripts.includes(lang),
    );
    return open;
  },
);

export const getTranscriptDownloadUrl = createSelector(
  [AppSelectors.simpleSelectors.studioEndpointUrl, AppSelectors.simpleSelectors.blockId],
  (studioEndpointUrl, blockId) => ({ language }) => downloadVideoTranscriptURL({
    studioEndpointUrl,
    blockId,
    language,
  }),
);

export const buildTranscriptUrl = createSelector(
  [AppSelectors.simpleSelectors.studioEndpointUrl],
  (studioEndpointUrl) => ({ transcriptUrl }) => mediaTranscriptURL({
    studioEndpointUrl,
    transcriptUrl,
  }),
);

export const getHandoutDownloadUrl = createSelector(
  [AppSelectors.simpleSelectors.studioEndpointUrl],
  (studioEndpointUrl) => ({ handout }) => downloadVideoHandoutUrl({
    studioEndpointUrl,
    handout,
  }),
);

export const videoSettings = createSelector(
  [
    module.simpleSelectors.videoSource,
    module.simpleSelectors.videoId,
    module.simpleSelectors.fallbackVideos,
    module.simpleSelectors.allowVideoDownloads,
    module.simpleSelectors.allowVideoSharing,
    module.simpleSelectors.thumbnail,
    module.simpleSelectors.transcripts,
    module.simpleSelectors.selectedVideoTranscriptUrls,
    module.simpleSelectors.allowTranscriptDownloads,
    module.simpleSelectors.duration,
    module.simpleSelectors.showTranscriptByDefault,
    module.simpleSelectors.handout,
    module.simpleSelectors.licenseType,
    module.simpleSelectors.licenseDetails,
  ],
  (
    videoSource,
    videoId,
    fallbackVideos,
    allowVideoDownloads,
    allowVideoSharing,
    thumbnail,
    transcripts,
    selectedVideoTranscriptUrls,
    allowTranscriptDownloads,
    duration,
    showTranscriptByDefault,
    handout,
    licenseType,
    licenseDetails,
  ) => (
    {
      videoSource,
      videoId,
      fallbackVideos,
      allowVideoDownloads,
      allowVideoSharing,
      thumbnail,
      transcripts,
      selectedVideoTranscriptUrls,
      allowTranscriptDownloads,
      duration,
      showTranscriptByDefault,
      handout,
      licenseType,
      licenseDetails,
    }
  ),
);

export default {
  ...simpleSelectors,
  openLanguages,
  getTranscriptDownloadUrl,
  buildTranscriptUrl,
  getHandoutDownloadUrl,
  videoSettings,
};
