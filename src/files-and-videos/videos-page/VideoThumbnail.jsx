import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { VideoFile } from '@openedx/paragon/icons';
import {
  Badge,
  Button,
  Icon,
  Image,
} from '@openedx/paragon';
import { FileInput, useFileInput } from '../generic';
import messages from './messages';
import { VIDEO_SUCCESS_STATUSES, VIDEO_FAILURE_STATUSES } from './data/constants';
import { RequestStatus } from '../../data/constants';

const VideoThumbnail = ({
  thumbnail,
  displayName,
  id,
  imageSize,
  handleAddThumbnail,
  videoImageSettings,
  status,
  pageLoadStatus,
  // injected
  intl,
}) => {
  const fileInputControl = useFileInput({
    onAddFile: (files) => {
      const [file] = files;
      handleAddThumbnail(file, id);
    },
    setSelectedRows: () => {},
    setAddOpen: () => false,
  });
  const [thumbnailError, setThumbnailError] = useState(false);
  const allowThumbnailUpload = videoImageSettings?.videoImageUploadEnabled;

  let addThumbnailMessage = 'Add thumbnail';
  if (allowThumbnailUpload) {
    if (thumbnail) {
      addThumbnailMessage = 'Replace thumbnail';
    }
  }
  const supportedFiles = videoImageSettings?.supportedFileFormats
    ? Object.values(videoImageSettings.supportedFileFormats) : null;
  const isUploaded = VIDEO_SUCCESS_STATUSES.includes(status);
  const isFailed = VIDEO_FAILURE_STATUSES.includes(status);
  const failedMessage = intl.formatMessage(messages.failedCheckboxLabel);

  const showThumbnail = allowThumbnailUpload && thumbnail && isUploaded;

  return (
    <div className="video-thumbnail row justify-content-center align-itmes-center">
      {allowThumbnailUpload && showThumbnail && <div className="thumbnail-overlay" />}
      {showThumbnail && !thumbnailError && pageLoadStatus === RequestStatus.SUCCESSFUL ? (
        <>
          <div className="border rounded">
            <Image
              style={imageSize}
              className="m-1 bg-light-300"
              src={thumbnail}
              alt={intl.formatMessage(messages.thumbnailAltMessage, { displayName })}
              onError={() => setThumbnailError(true)}
            />
          </div>
          <div className="add-thumbnail" data-testid={`video-thumbnail-${id}`}>
            <Button
              variant="primary"
              size="sm"
              onClick={fileInputControl.click}
              tabIndex={0}
            >
              {addThumbnailMessage}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div
            className="row justify-content-center align-items-center m-0 border rounded"
            style={imageSize}
          >
            <Icon src={VideoFile} style={{ height: '48px', width: '48px' }} />
          </div>
          <div className="status-badge">
            {!isUploaded && (
              <Badge variant="light">
                {!isFailed ? status : failedMessage}
              </Badge>
            )}
          </div>
        </>
      )}
      {allowThumbnailUpload && (
        <FileInput
          key="video-thumbnail-upload"
          fileInput={fileInputControl}
          supportedFileFormats={supportedFiles}
          allowMultiple={false}
        />
      )}
    </div>
  );
};

VideoThumbnail.propTypes = {
  thumbnail: PropTypes.string,
  displayName: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  imageSize: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
  }).isRequired,
  handleAddThumbnail: PropTypes.func.isRequired,
  videoImageSettings: PropTypes.shape({
    videoImageUploadEnabled: PropTypes.bool.isRequired,
    supportedFileFormats: PropTypes.shape({}),
  }).isRequired,
  status: PropTypes.string.isRequired,
  pageLoadStatus: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

VideoThumbnail.defaultProps = {
  thumbnail: null,
};

export default injectIntl(VideoThumbnail);
