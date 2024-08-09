import { useState, createContext } from 'react';
import { thunkActions } from '../../data/redux';

import { StrictDict } from '../../utils';
import * as module from './hooks';

export const ErrorContext = createContext();

export const state = StrictDict({
  /* eslint-disable react-hooks/rules-of-hooks */
  durationErrors: (val) => useState(val),
  handoutErrors: (val) => useState(val),
  licenseErrors: (val) => useState(val),
  thumbnailErrors: (val) => useState(val),
  transcriptsErrors: (val) => useState(val),
  videoSourceErrors: (val) => useState(val),
  /* eslint-enable react-hooks/rules-of-hooks */
});

export const errorsHook = () => {
  const [durationErrors, setDurationErrors] = module.state.durationErrors({});
  const [handoutErrors, setHandoutErrors] = module.state.handoutErrors({});
  const [licenseErrors, setLicenseErrors] = module.state.licenseErrors({});
  const [thumbnailErrors, setThumbnailErrors] = module.state.thumbnailErrors({});
  const [transcriptsErrors, setTranscriptsErrors] = module.state.transcriptsErrors({});
  const [videoSourceErrors, setVideoSourceErrors] = module.state.videoSourceErrors({});

  return {
    error: {
      duration: [durationErrors, setDurationErrors],
      handout: [handoutErrors, setHandoutErrors],
      license: [licenseErrors, setLicenseErrors],
      thumbnail: [thumbnailErrors, setThumbnailErrors],
      transcripts: [transcriptsErrors, setTranscriptsErrors],
      videoSource: [videoSourceErrors, setVideoSourceErrors],
    },
    validateEntry: () => {
      if (Object.keys(durationErrors).length > 0) { return false; }
      if (Object.keys(handoutErrors).length > 0) { return false; }
      if (Object.keys(licenseErrors).length > 0) { return false; }
      if (Object.keys(thumbnailErrors).length > 0) { return false; }
      if (Object.keys(transcriptsErrors).length > 0) { return false; }
      if (Object.keys(videoSourceErrors).length > 0) { return false; }
      return true;
    },
  };
};
export const fetchVideoContent = () => ({ dispatch }) => (
  dispatch(thunkActions.video.saveVideoData())
);
