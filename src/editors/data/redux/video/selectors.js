import { createSelector } from 'reselect';

import { keyStore } from '../../../utils';
import { videoTranscriptLanguages } from '../../constants/video';

import { initialState } from './reducer';
import * as module from './selectors';
import * as AppSelectors from '../app/selectors';
import { downloadVideoTranscriptURL, downloadVideoHandoutUrl } from '../../services/cms/urls';

const stateKeys = keyStore(initialState);

export const video = (state) => state.video;

export const simpleSelectors = [
  stateKeys.videoSource,
  stateKeys.videoId,
  stateKeys.fallbackVideos,
  stateKeys.allowVideoDownloads,
  stateKeys.thumbnail,
  stateKeys.transcripts,
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
    module.simpleSelectors.thumbnail,
    module.simpleSelectors.transcripts,
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
    thumbnail,
    transcripts,
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
      thumbnail,
      transcripts,
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
  getHandoutDownloadUrl,
  videoSettings,
};
