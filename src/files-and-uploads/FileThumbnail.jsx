import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Image,
} from '@edx/paragon';
import {
  AudioFile,
  Terminal,
  // FolderZip,
  InsertDriveFile,
} from '@edx/paragon/icons';

const AssetThumbnail = ({
  thumbnail,
  wrapperType,
  externalUrl,
  displayName,
}) => (
  <div className="row justify-content-center">
    {thumbnail ? (
      <Image fluid thumbnail src={externalUrl} alt={`Thumbnail of ${displayName}`} />
    ) : (
      <div className="border rounded p-1">
        {wrapperType === 'documents' && <Icon src={InsertDriveFile} style={{ height: '48px', width: '48px' }} />}
        {wrapperType === 'code' && <Icon src={Terminal} style={{ height: '48px', width: '48px' }} />}
        {wrapperType === 'audio' && <Icon src={AudioFile} style={{ height: '48px', width: '48px' }} />}
        {wrapperType === 'other' && <Icon src={InsertDriveFile} style={{ height: '48px', width: '48px' }} />}
      </div>
    )}
  </div>
);

AssetThumbnail.defaultProps = {
  thumbnail: null,
};
AssetThumbnail.propTypes = {
  thumbnail: PropTypes.string,
  wrapperType: PropTypes.string.isRequired,
  externalUrl: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
};

export default AssetThumbnail;
