import { singleVideoData } from '../../services/cms/mockVideoData';
import { actions, selectors } from '..';
import * as requests from './requests';

export const loadVideoData = () => (dispatch) => {
  dispatch(actions.video.load(singleVideoData));
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
  saveVideoData,
  uploadTranscript,
  deleteTranscript,
  replaceTranscript,
};
