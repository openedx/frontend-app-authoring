import { actions, selectors } from '..';
import * as requests from './requests';
import * as module from './video';

export const loadVideoData = () => (dispatch, getState) => {
  const state = getState();
  const rawVideoData = state.app.blockValue.data.metadata ? state.app.blockValue.data.metadata : {};
  const {
    videoSource,
    videoId,
    fallbackVideos,
  } = module.determineVideoSource({
    edxVideoId: rawVideoData.edx_video_id,
    youtubeId: rawVideoData.youtube_id_1_0,
    html5Sources: rawVideoData.html5_sources,
  });

  // we don't appear to want to parse license version
  const [licenseType, licenseOptions] = module.parseLicense(rawVideoData.license);

  dispatch(actions.video.load({
    videoSource,
    videoId,
    fallbackVideos,
    allowVideoDownloads: rawVideoData.download_video,
    transcripts: rawVideoData.transcripts || {},
    allowTranscriptDownloads: rawVideoData.download_track,
    showTranscriptByDefault: rawVideoData.show_captions,
    duration: { // TODO duration is not always sent so they should be calculated.
      startTime: rawVideoData.start_time,
      stopTime: rawVideoData.end_time,
      total: null, // TODO can we get total duration? if not, probably dropping from widget
    },
    handout: rawVideoData.handout,
    licenseType,
    licenseDetails: {
      attribution: licenseOptions.by,
      noncommercial: licenseOptions.nc,
      noDerivatives: licenseOptions.nd,
      shareAlike: licenseOptions.sa,
    },
  }));
};

export const determineVideoSource = ({
  edxVideoId,
  youtubeId,
  html5Sources,
}) => {
  // videoSource should be the edx_video_id, the youtube url or the first fallback url in that order.
  // If we are falling back to the first fallback url, remove it from the list of fallback urls for display.
  const youtubeUrl = `https://youtu.be/${youtubeId}`;
  const videoId = edxVideoId || '';
  let videoSource = '';
  let fallbackVideos = [];
  if (edxVideoId) {
    [videoSource, fallbackVideos] = [edxVideoId, html5Sources];
    // videoSource = edxVideoId;
    // fallbackVideos = html5Sources;
  } else if (youtubeId) {
    [videoSource, fallbackVideos] = [youtubeUrl, html5Sources];
    // videoSource = youtubeUrl;
    // fallbackVideos = html5Sources;
  } else if (Array.isArray(html5Sources) && html5Sources[0]) {
    [videoSource, fallbackVideos] = [html5Sources[0], html5Sources.slice(1)];
    // videoSource = html5Sources[0];
    // fallbackVideos = html5Sources.slice(1);
  }
  if (fallbackVideos.length === 0) {
    fallbackVideos = ['', ''];
  }
  return {
    videoSource,
    videoId,
    fallbackVideos,
  };
};

// copied from frontend-app-learning/src/courseware/course/course-license/CourseLicense.jsx
// in the long run, should be shared (perhaps one day the learning MFE will depend on this repo)
export const parseLicense = (license) => {
  if (!license) {
    // Default to All Rights Reserved if no license
    // is detected
    return ['all-rights-reserved', {}];
  }

  // Search for a colon character denoting the end
  // of the license type and start of the options
  const colonIndex = license.indexOf(':');
  if (colonIndex === -1) {
    // no options, so the entire thing is the license type
    return [license, {}];
  }

  // Split the license on the colon
  const licenseType = license.slice(0, colonIndex).trim();
  const optionStr = license.slice(colonIndex + 1).trim();

  let options = {};
  let version = '';

  // Set the defaultVersion to 4.0
  const defaultVersion = '4.0';
  optionStr.split(' ').forEach(option => {
    // Split the option into key and value
    // Default the value to `true` if no value
    let key = '';
    let value = '';
    if (option.indexOf('=') !== -1) {
      [key, value] = option.split('=');
    } else {
      key = option;
      value = true;
    }

    // Check for version
    if (key === 'ver') {
      version = value;
    } else {
      // Set the option key to lowercase to make
      // it easier to query
      options[key.toLowerCase()] = value;
    }
  });

  // No options
  if (Object.keys(options).length === 0) {
    // If no other options are set for the
    // license, set version to 1.0
    version = '1.0';

    // Set the `zero` option so the link
    // works correctly
    options = {
      zero: true,
    };
  }

  // Set the version to whatever was included,
  // using `defaultVersion` as a fallback if unset
  version = version || defaultVersion;

  return [licenseType, options, version];
};

export const saveVideoData = () => () => {
  // dispatch(actions.app.setBlockContent)
  // dispatch(requests.saveBlock({ });
};

// Transcript Thunks:

export const uploadTranscript = ({ language, filename, file }) => (dispatch, getState) => {
  const state = getState();
  const { transcripts, videoId } = state.video;
  let lang = language;
  if (!language) {
    [[lang]] = selectors.video.openLanguages(state);
  }
  dispatch(requests.uploadTranscript({
    language: lang,
    videoId,
    transcript: file,
    onSuccess: (response) => {
      dispatch(actions.video.updateField({
        transcripts: {
          ...transcripts,
          [lang]: { filename },
        },
      }));
      if (selectors.video.videoId(state) === '') {
        dispatch(actions.video.updateField({
          videoId: response.edx_video_id,
        }));
      }
    },

  }));
};

export const deleteTranscript = ({ language }) => (dispatch, getState) => {
  const state = getState();
  const { transcripts, videoId } = state.video;
  dispatch(requests.deleteTranscript({
    language,
    videoId,
    onSuccess: () => {
      const updateTranscripts = {};
      Object.keys(transcripts).forEach((key) => {
        if (key !== language) {
          updateTranscripts[key] = transcripts[key];
        }
      });
      dispatch(actions.video.updateField({ transcripts: updateTranscripts }));
    },
  }));
};

export const replaceTranscript = ({ newFile, newFilename, language }) => (dispatch, getState) => {
  const state = getState();
  const { transcripts, videoId } = state.video;
  dispatch(requests.deleteTranscript({
    language,
    videoId,
    onSuccess: () => {
      const updateTranscripts = {};
      Object.keys(transcripts).forEach((key) => {
        if (key !== language) {
          updateTranscripts[key] = transcripts[key];
        }
      });
      dispatch(actions.video.updateField({ transcripts: updateTranscripts }));
      dispatch(uploadTranscript({ language, file: newFile, filename: newFilename }));
    },
  }));
};

export default {
  loadVideoData,
  determineVideoSource,
  parseLicense,
  saveVideoData,
  uploadTranscript,
  deleteTranscript,
  replaceTranscript,
};
