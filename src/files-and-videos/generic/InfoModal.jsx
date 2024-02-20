import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  injectIntl,
  intlShape,
  FormattedMessage,
} from '@edx/frontend-platform/i18n';
import {
  Icon,
  ModalDialog,
  Stack,
  Truncate,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import messages from './messages';
import UsageMetricsMessages from './UsageMetricsMessage';
import FileThumbnail from './ThumbnailPreview';
import { TRANSCRIPT_FAILURE_STATUSES } from '../videos-page/data/constants';
import AlertMessage from '../../generic/alert-message';

const InfoModal = ({
  file,
  isOpen,
  onClose,
  thumbnailPreview,
  usagePathStatus,
  error,
  sidebar,
  // injected
  intl,
}) => {
  const [activeTab, setActiveTab] = useState('fileInfo');
  const showTranscriptionError = TRANSCRIPT_FAILURE_STATUSES.includes(file?.transcriptionStatus)
    && activeTab !== 'fileInfo';

  return (
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
        {showTranscriptionError && (
          <AlertMessage
            description={(
              <div className="row m-0 align-itmes-center">
                <Icon src={Error} className="text-danger-500 mr-2" />
                {intl.formatMessage(messages.transcriptionErrorMessage, { error: file.errorDescription })}
              </div>
            )}
            variant="danger"
          />
        )}
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
            {sidebar(file, activeTab, setActiveTab)}
          </div>
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

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
    transcriptionStatus: PropTypes.string,
    errorDescription: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  usagePathStatus: PropTypes.string.isRequired,
  error: PropTypes.arrayOf(PropTypes.string).isRequired,
  thumbnailPreview: PropTypes.func.isRequired,
  sidebar: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

InfoModal.defaultProps = {
  file: null,
};

export default injectIntl(InfoModal);
