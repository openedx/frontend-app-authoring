import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, Stack, Truncate } from '@openedx/paragon';
import UploadStatusIcon from './UploadStatusIcon';
import { RequestStatus } from '../../../data/constants';

const UploadProgressList = ({ videosList }) => (
  <div role="list" className="text-primary-500">
    {videosList.map(([id, video], index) => {
      const bulletNumber = `${index + 1}. `;
      return (
        <Stack role="listitem" gap={2} direction="horizontal" className="mb-3 small" key={id}>
          <span>{bulletNumber}</span>
          <div className="col-5 pl-0">
            <Truncate>
              {video.name}
            </Truncate>
          </div>
          <div className="col-6 p-0">
            {video.status === RequestStatus.FAILED ? (
              <span className="row m-0 justify-content-end font-weight-bold">
                {video.status.toUpperCase()}
              </span>
            ) : (
              <ProgressBar now={video.progress} variant="info" />
            )}
          </div>
          <UploadStatusIcon status={video.status} />
        </Stack>
      );
    })}
  </div>
);

UploadProgressList.propTypes = {
  videosList: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    uploadPercentage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  })).isRequired,
};

export default UploadProgressList;
