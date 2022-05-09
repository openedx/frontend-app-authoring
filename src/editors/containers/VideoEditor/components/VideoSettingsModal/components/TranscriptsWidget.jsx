import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling video transcripts
 */
export const TranscriptWidget = () => {
  const dispatch = useDispatch();
  const values = hooks.widgetValues({
    dispatch,
    fields: {
      [hooks.selectorKeys.transcripts]: hooks.objectWidget,
      [hooks.selectorKeys.allowTranscriptDownloads]: hooks.genericWidget,
      [hooks.selectorKeys.showTranscriptByDefault]: hooks.genericWidget,
    },
  });
  const {
    transcripts,
    allowTranscriptDownloads: allowDownload,
    showTranscriptByDefault: showByDefault,
  } = values;
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
