// import { createSelector } from 'reselect';

import { keyStore } from '../../../utils';

import { initialState } from './reducer';
// import * as module from './selectors';

const stateKeys = keyStore(initialState);

export const video = (state) => state.video;

export const simpleSelectors = [
  stateKeys.videoSource,
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
].reduce((obj, key) => ({ ...obj, [key]: state => state.video[key] }), {});

export default {
  ...simpleSelectors,
};
