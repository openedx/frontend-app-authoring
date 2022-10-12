import React from 'react';
import { thunkActions, actions } from '../../../../../../data/redux';
import * as module from './hooks';
import { videoTranscriptLanguages } from '../../../../../../data/constants/video';
import { ErrorContext } from '../../../../hooks';
import messages from './messages';

export const state = {
  inDeleteConfirmation: (args) => React.useState(args),
};

export const updateErrors = ({ isUploadError, isDeleteError }) => {
  const [error, setError] = React.useContext(ErrorContext).transcripts;
  if (isUploadError) {
    setError({ ...error, uploadError: messages.uploadTranscriptError.defaultMessage });
  }
  if (isDeleteError) {
    setError({ ...error, deleteError: messages.deleteTranscriptError.defaultMessage });
  }
};

export const transcriptLanguages = (transcripts) => {
  const languages = [];
  if (transcripts && Object.keys(transcripts).length > 0) {
    Object.keys(transcripts).forEach(transcript => {
      languages.push(videoTranscriptLanguages[transcript]);
    });
    return languages.join(', ');
  }
  return 'None';
};

export const hasTranscripts = (transcripts) => {
  if (transcripts && Object.keys(transcripts).length > 0) {
    return true;
  }
  return false;
};

export const onSelectLanguage = ({
  filename, dispatch, transcripts, languageBeforeChange,
}) => (e) => {
  const { [languageBeforeChange]: removedProperty, ...trimmedTranscripts } = transcripts;
  const newTranscripts = { [e.target.value]: { filename }, ...trimmedTranscripts };
  dispatch(actions.video.updateField({ transcripts: newTranscripts }));
};

export const replaceFileCallback = ({ language, dispatch }) => (file) => {
  dispatch(thunkActions.video.replaceTranscript({
    newFile: file,
    newFilename: file.name,
    language,
  }));
};

export const addFileCallback = ({ dispatch }) => (file) => {
  dispatch(thunkActions.video.uploadTranscript({
    file,
    filename: file.name,
    language: null,
  }));
};

export const fileInput = ({ onAddFile }) => {
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      onAddFile(file);
    }
  };
  return {
    click,
    addFile,
    ref,
  };
};

export const setUpDeleteConfirmation = () => {
  const [inDeleteConfirmation, setInDeleteConfirmation] = module.state.inDeleteConfirmation(false);
  return {
    inDeleteConfirmation,
    launchDeleteConfirmation: () => setInDeleteConfirmation(true),
    cancelDelete: () => setInDeleteConfirmation(false),
  };
};

export default {
  transcriptLanguages,
  fileInput,
  onSelectLanguage,
  replaceFileCallback,
  addFileCallback,
  setUpDeleteConfirmation,
};
