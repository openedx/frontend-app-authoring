import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import {
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  IconButton,
  Icon,
} from '@edx/paragon';
import { Delete } from '@edx/paragon/icons';

import hooks from './hooks';
import CollapsibleFormWidget from './CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling video source as well as fallback sources
 */
export const VideoSourceWidget = () => {
  const dispatch = useDispatch();
  const {
    videoSource: source,
    fallbackVideos,
    allowVideoDownloads: allowDownload,
  } = hooks.widgetValues({
    dispatch,
    fields: {
      [hooks.selectorKeys.videoSource]: hooks.genericWidget,
      [hooks.selectorKeys.fallbackVideos]: hooks.arrayWidget,
      [hooks.selectorKeys.allowVideoDownloads]: hooks.genericWidget,
    },
  });

  return (
    <CollapsibleFormWidget
      title="Video source"
    >
      <FormGroup size="sm">
        <div className="border-primary-100 border-bottom pb-4">
          <FormLabel size="sm">Video ID or URL</FormLabel>
          <FormControl
            onChange={source.onChange}
            onBlur={source.onBlur}
            value={source.local}
          />
        </div>
        <FormLabel>Fallback videos</FormLabel>
        <FormLabel>
          {`
          To be sure all learners can access the video, edX
          recommends providing additional videos in both .mp4 and
          .webm formats.  The first listed video compatible with the
          learner's device will play.
          `}
        </FormLabel>
        {[0, 1].map((index) => (
          <div className="mb-1">
            <FormControl
              className="d-inline-block"
              style={{ width: '260px' }}
              onChange={fallbackVideos.onChange(index)}
              value={fallbackVideos.local[index]}
              onBlur={fallbackVideos.onBlur(index)}
            />
            <IconButton
              className="d-inline-block"
              iconAs={Icon}
              src={Delete}
              alt="Clear fallback video"
              onClick={fallbackVideos.onClear(index)}
            />
          </div>
        ))}
        <FormCheck
          checked={allowDownload.local}
          onChange={allowDownload.onCheckedChange}
          label="Alow video downloads"
        />
      </FormGroup>
    </CollapsibleFormWidget>
  );
};

export default VideoSourceWidget;
