import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

export const VideoSourceWidget = () => {
  const dispatch = useDispatch();
  const source = hooks.widgetValue(hooks.selectorKeys.videoSource, dispatch);
  const fallbackVideos = hooks.widgetValue(hooks.selectorKeys.fallbackVideos, dispatch);
  const allowDownload = hooks.widgetValue(hooks.selectorKeys.allowVideoDownloads, dispatch);
  return (
    <CollapsibleFormWidget title="Video source">
      <div>Video Source Widget</div>
      <p><b>Video Source:</b> {source.formValue}</p>
      <p><b>Fallback Videos:</b> {fallbackVideos.formValue.join(', ')}</p>
      <p><b>Video Source:</b> {allowDownload.formValue ? 'True' : 'False'}</p>
    </CollapsibleFormWidget>
  );
};

export default VideoSourceWidget;
