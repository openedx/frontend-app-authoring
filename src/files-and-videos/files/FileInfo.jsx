import React from 'react';
import PropTypes from 'prop-types';

import {
  injectIntl,
  FormattedMessage,
} from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Truncate,
} from '@edx/paragon';

import messages from '../messages';
import UsageMetricsMessages from '../../generic/UsageMetricsMessage';
import FileInfoAssetSidebar from '../assets/FileInfoAssetSidebar';
import FileInfoVideoSidebar from '../videos/info-sidebar/FileInfoVideoSidebar';
import FileThumbnail from './FileThumbnail';

const FileInfo = ({
  file,
  isOpen,
  onClose,
  handleLockedFile,
  thumbnailPreview,
  usagePathStatus,
  error,
}) => (
  <ModalDialog
    title={file?.displayName}
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    hasCloseButton
    data-testid="file-info-modal"
  >
    <ModalDialog.Header>
      <ModalDialog.Title>
        <div style={{ wordBreak: 'break-word' }}>
          <Truncate lines={2} className="font-weight-bold small mt-3">
            {file?.displayName}
          </Truncate>
        </div>
      </ModalDialog.Title>
    </ModalDialog.Header>
    <ModalDialog.Body className="pt-0 x-small">
      <hr />
      <div className="row flex-nowrap m-0 mt-4">
        <div className="col-7 mr-3">
          <FileThumbnail
            thumbnail={file?.thumbnail}
            externalUrl={file?.externalUrl}
            displayName={file?.displayName}
            wrapperType={file?.wrapperType}
            id={file?.id}
            status={file?.status}
            thumbnailPreview={thumbnailPreview}
            imageSize={{ width: '503px', height: '281px' }}
          />
        </div>
        <div className="col-5">
          {file?.wrapperType === 'video' ? (
            <FileInfoVideoSidebar video={file} />
          ) : (
            <FileInfoAssetSidebar asset={file} handleLockedAsset={handleLockedFile} />
          )}
        </div>
      </div>
      <div className="row m-0 pt-3 font-weight-bold">
        <FormattedMessage {...messages.usageTitle} />
      </div>
      <UsageMetricsMessages {...{ usageLocations: file?.usageLocations, usagePathStatus, error }} />
    </ModalDialog.Body>
  </ModalDialog>
);

FileInfo.propTypes = {
  file: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    wrapperType: PropTypes.string.isRequired,
    locked: PropTypes.bool,
    externalUrl: PropTypes.string,
    thumbnail: PropTypes.string,
    id: PropTypes.string.isRequired,
    portableUrl: PropTypes.string,
    dateAdded: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    usageLocations: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleLockedFile: PropTypes.func.isRequired,
  usagePathStatus: PropTypes.string.isRequired,
  error: PropTypes.arrayOf(PropTypes.string).isRequired,
  thumbnailPreview: PropTypes.func.isRequired,
};

FileInfo.defaultProps = {
  file: null,
};

export default injectIntl(FileInfo);
