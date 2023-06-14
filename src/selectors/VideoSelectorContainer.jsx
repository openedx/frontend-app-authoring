import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { VideoSelectorPage } from '@edx/frontend-lib-content-components';
import { getConfig } from '@edx/frontend-platform';

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
