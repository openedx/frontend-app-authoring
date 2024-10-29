import { useState, createContext } from 'react';
import { thunkActions } from '../../data/redux';

import { StrictDict } from '../../utils';

type ErrRecord = Record<string, string>;
type ErrCategory = [errors: ErrRecord, setter: (newErrors: ErrRecord) => void];
interface ErrorContextData {
  duration: ErrCategory;
  handout: ErrCategory;
  license: ErrCategory;
  thumbnail: ErrCategory;
  transcripts: ErrCategory;
  videoSource: ErrCategory;
}

/* istanbul ignore next */
export const ErrorContext = createContext<ErrorContextData>({
  duration: [{}, () => {}],
  handout: [{}, () => {}],
  license: [{}, () => {}],
  thumbnail: [{}, () => {}],
  transcripts: [{}, () => {}],
  videoSource: [{}, () => {}],
});

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

export const errorsHook = (): { error: ErrorContextData, validateEntry: () => boolean } => {
  const [durationErrors, setDurationErrors] = state.durationErrors({});
  const [handoutErrors, setHandoutErrors] = state.handoutErrors({});
  const [licenseErrors, setLicenseErrors] = state.licenseErrors({});
  const [thumbnailErrors, setThumbnailErrors] = state.thumbnailErrors({});
  const [transcriptsErrors, setTranscriptsErrors] = state.transcriptsErrors({});
  const [videoSourceErrors, setVideoSourceErrors] = state.videoSourceErrors({});

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
