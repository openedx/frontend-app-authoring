import React from 'react';
import PropTypes from 'prop-types';

import {
  injectIntl,
  FormattedMessage,
} from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  Stack,
  Truncate,
} from '@edx/paragon';

import messages from './messages';
import UsageMetricsMessages from './UsageMetricsMessage';
import FileThumbnail from './ThumbnailPreview';

const InfoModal = ({
  file,
  isOpen,
  onClose,
  thumbnailPreview,
  usagePathStatus,
  error,
  sidebar,
}) => (
  <ModalDialog
    title={file?.displayName}
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    hasCloseButton
    data-testid="file-info-modal"
    style={{ minHeight: '799px' }}
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
          <Stack gap={5}>
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
            <div>
              <div className="row m-0 font-weight-bold">
                <FormattedMessage {...messages.usageTitle} />
              </div>
              <UsageMetricsMessages {...{ usageLocations: file?.usageLocations, usagePathStatus, error }} />
            </div>
          </Stack>
        </div>
        <div className="col-5">
          {sidebar(file)}
        </div>
      </div>
    </ModalDialog.Body>
  </ModalDialog>
);

InfoModal.propTypes = {
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
  usagePathStatus: PropTypes.string.isRequired,
  error: PropTypes.arrayOf(PropTypes.string).isRequired,
  thumbnailPreview: PropTypes.func.isRequired,
  sidebar: PropTypes.func.isRequired,
};

InfoModal.defaultProps = {
  file: null,
};

export default injectIntl(InfoModal);
