import { useState } from 'react';

import { StrictDict } from '../../utils';
import * as module from './hooks';

export const state = StrictDict({
  durationErrors: (val) => useState(val),
  handoutErrors: (val) => useState(val),
  licenseErrors: (val) => useState(val),
  thumbnailErrors: (val) => useState(val),
  transcriptsErrors: (val) => useState(val),
  videoSourceErrors: (val) => useState(val),
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
      duration: durationErrors,
      handout: handoutErrors,
      license: licenseErrors,
      thumbnail: thumbnailErrors,
      transcripts: transcriptsErrors,
      videoSource: videoSourceErrors,
    },
    validateEntry: () => {
      let validated = true;
      if (!module.validateDuration({ setDurationErrors })) { validated = false; }
      if (!module.validateHandout({ setHandoutErrors })) { validated = false; }
      if (!module.validateLicense({ setLicenseErrors })) { validated = false; }
      if (!module.validateThumbnail({ setThumbnailErrors })) { validated = false; }
      if (!module.validateTranscripts({ setTranscriptsErrors })) { validated = false; }
      if (!module.validateVideoSource({ setVideoSourceErrors })) { validated = false; }
      return validated;
    },
  };
};

export const validateDuration = ({ setDurationErrors }) => {
  setDurationErrors({
    fieldName: 'sample error message',
  });
  return false;
};
export const validateHandout = ({ setHandoutErrors }) => {
  setHandoutErrors({
    fieldName: 'sample error message',
  });
  return false;
};
export const validateLicense = ({ setLicenseErrors }) => {
  setLicenseErrors({
    fieldName: 'sample error message',
  });
  return false;
};
export const validateThumbnail = ({ setThumbnailErrors }) => {
  setThumbnailErrors({
    fieldName: 'sample error message',
  });
  return false;
};
export const validateTranscripts = ({ setTranscriptsErrors }) => {
  setTranscriptsErrors({
    fieldName: 'sample error message',
  });
  return false;
};
export const validateVideoSource = ({ setVideoSourceErrors }) => {
  setVideoSourceErrors({
    fieldName: 'sample error message',
  });
  return false;
};
