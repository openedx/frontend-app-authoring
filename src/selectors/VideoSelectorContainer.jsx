import React from 'react';
import PropTypes from 'prop-types';
import { VideoSelectorPage } from '@edx/frontend-lib-content-components';
import { getConfig } from '@edx/frontend-platform';

const VideoSelectorContainer = ({
  courseId,
}) => (
  <div className="selector-page">
    <VideoSelectorPage
      courseId={courseId}
      studioEndpointUrl={getConfig().STUDIO_BASE_URL}
      lmsEndpointUrl={getConfig().LMS_BASE_URL}
    />
  </div>
  );

VideoSelectorContainer.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default VideoSelectorContainer;
