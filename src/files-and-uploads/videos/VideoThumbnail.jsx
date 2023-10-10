import React from 'react';
import PropTypes from 'prop-types';
import { VideoFile } from '@edx/paragon/icons';
import {
  Badge,
  Button,
  Icon,
  Image,
} from '@edx/paragon';
import FileInput, { useFileInput } from '../FileInput';

const VideoThumbnail = ({
  thumbnail,
  displayName,
  id,
  imageSize,
  handleAddThumbnail,
  videoImageSettings,
  status,
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
  case 'Uploaded':
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
    <div className="video-thumbnail row justify-content-center align-itmes-center">
      <div className="thumbnail-overlay" />
      {showThumbnail ? (
        <Image
          style={imageSize}
          className="border rounded p-1"
          src={thumbnail}
          alt={`Thumbnail of ${displayName}`}
        />
      ) : (
        <>
          <div
            className="row border justify-content-center align-items-center rounded m-0"
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
          disabled={!showThumbnail}
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
  thumbnail: PropTypes.string.isRequired,
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
};

export default VideoThumbnail;
