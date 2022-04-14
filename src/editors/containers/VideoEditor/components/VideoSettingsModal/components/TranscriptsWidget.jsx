import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

export const TranscriptWidget = () => {
  const dispatch = useDispatch();
  const transcripts = hooks.widgetValue(hooks.selectorKeys.transcripts, dispatch);
  const allowDownload = hooks.widgetValue(
    hooks.selectorKeys.allowTranscriptDownloads,
    dispatch,
  );
  const showByDefault = hooks.widgetValue(
    hooks.selectorKeys.showTranscriptByDefault,
    dispatch,
  );
  return (
    <CollapsibleFormWidget title="Transcript">
      <b>Transcripts</b>
      <p>English: {transcripts.formValue.english}</p>
      <p><b>Allow downloads:</b> {allowDownload.formValue ? 'True' : 'False' }</p>
      <p><b>Show by default:</b> {showByDefault.formValue ? 'True' : 'False' }</p>
    </CollapsibleFormWidget>
  );
};

export default TranscriptWidget;
