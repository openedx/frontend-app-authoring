import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import VideoSelectorPage from '../editors/VideoSelectorPage';

const VideoSelectorContainer = ({
  courseId,
}) => {
  const { blockId } = useParams();
  return (
    <div className="selector-page">
      <VideoSelectorPage
        blockId={blockId}
        courseId={courseId}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
      />
    </div>
  );
};

VideoSelectorContainer.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default VideoSelectorContainer;
