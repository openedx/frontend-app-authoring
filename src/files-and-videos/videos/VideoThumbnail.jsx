import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { VideoFile } from '@edx/paragon/icons';
import {
  Badge,
  Button,
  Icon,
  Image,
} from '@edx/paragon';
import FileInput, { useFileInput } from '../FileInput';
import messages from './messages';

const VideoThumbnail = ({
  thumbnail,
  displayName,
  id,
  imageSize,
  handleAddThumbnail,
  videoImageSettings,
  status,
  // injected
  intl,
}) => {
  const fileInputControl = useFileInput({
    onAddFile: (file) => handleAddThumbnail(file, id),
    setSelectedRows: () => {},
    setAddOpen: () => false,
  });

  let addThumbnailMessage = 'Enable thumbnail upload';
  if (videoImageSettings?.videoImageUploadEnabled) {
    if (thumbnail) {
      addThumbnailMessage = 'Edit thumbnail';
    } else {
      addThumbnailMessage = 'Add thumbnail';
    }
  }
  const supportedFiles = videoImageSettings?.supportedFileFormats
    ? Object.values(videoImageSettings.supportedFileFormats) : null;
  let isUploaded = false;
  switch (status) {
  case 'Ready':
    isUploaded = true;
    break;
  case 'Imported':
    isUploaded = true;
    break;
  default:
    break;
  }
  const showThumbnail = videoImageSettings?.videoImageUploadEnabled && thumbnail && isUploaded;

  return (
    <div data-testid={`video-thumbnail-${id}`} className="video-thumbnail row justify-content-center align-itmes-center">
      <div className="thumbnail-overlay" />
      {showThumbnail ? (
        <div className="border rounded">
          <Image
            style={imageSize}
            className="m-1 bg-light-300"
            src={thumbnail}
            alt={intl.formatMessage(messages.thumbnailAltMessage, { displayName })}
          />
        </div>
      ) : (
        <>
          <div
            className="row justify-content-center align-items-center m-0 border rounded"
            style={imageSize}
          >
            <Icon src={VideoFile} style={{ height: '48px', width: '48px' }} />
          </div>
          <div className="status-badge">
            <Badge variant="light">
              {status}
            </Badge>
          </div>
        </>
      )}
      <div className="add-thumbnail">
        <Button
          variant="primary"
          size="sm"
          onClick={fileInputControl.click}
          tabIndex="0"
        >
          {addThumbnailMessage}
        </Button>
      </div>
      <FileInput
        key="video-thumbnail-upload"
        fileInput={fileInputControl}
        supportedFileFormats={supportedFiles}
        allowMultiple={false}
      />
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
  // injected
  intl: intlShape.isRequired,
};

VideoThumbnail.defaultProps = {
  thumbnail: null,
};

export default injectIntl(VideoThumbnail);
