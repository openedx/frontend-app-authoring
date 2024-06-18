import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Button,
  Hyperlink,
  Icon,
  ModalDialog,
  ProgressBar,
  Scrollable,
  Stack,
  Truncate,
} from '@openedx/paragon';
import { Check, ErrorOutline, WarningFilled } from '@openedx/paragon/icons';
import messages from './messages';
import { RequestStatus } from '../../data/constants';

const UploadTrackerModal = ({
  isUploadTrackerOpen,
  handleUploadCancel,
  currentUploadingIdsRef,
}) => {
  const intl = useIntl();
  const videosPagePath = '';
  const { uploadData, uploadCount } = currentUploadingIdsRef;

  return (
    <ModalDialog
      title={intl.formatMessage(messages.videoUploadTrackerModalTitle)}
      isOpen={isUploadTrackerOpen}
      onClose={handleUploadCancel}
      isBlocking
      hasCloseButton={false}
      size="lg"
    >
      <ModalDialog.Header>
        <ModalDialog.Title className="mb-3">
          {intl.formatMessage(messages.videoUploadTrackerModalTitle)}
        </ModalDialog.Title>
        <Alert
          variant="warning"
          icon={WarningFilled}
        >
          <Alert.Heading>
            {intl.formatMessage(messages.videoUploadTrackerAlertTitle)}
          </Alert.Heading>
          {intl.formatMessage(messages.videoUploadTrackerAlertBodyMessage)}
          <div className="mt-3">
            <span className="font-weight-bold">
              {intl.formatMessage(messages.videoUploadTrackerAlertEditMessage)}
            </span>
            <Hyperlink
              className="ml-2"
              destination={videosPagePath}
              target="_blank"
              content={intl.formatMessage(messages.videoUploadTrackerAlertEditHyperlinkLabel)}
            />
          </div>
        </Alert>
        <div className="my-4 text-primary-500">
          {intl.formatMessage(
            messages.videoUploadTrackerModalBody,
            { uploadCount },
          )}
        </div>
      </ModalDialog.Header>
      <Scrollable>
        <ModalDialog.Body>
          <div role="list" className="text-primary-500">
            {Object.entries(uploadData).map(([id, video], index) => {
              const bulletNumber = `${index + 1}. `;
              const getIcon = () => {
                switch (video.status) {
                case RequestStatus.SUCCESSFUL:
                  return (<Icon src={Check} />);
                case RequestStatus.FAILED:
                  return (<Icon src={ErrorOutline} />);
                default:
                  return (<div style={{ width: '24px' }} />);
                }
              };
              return (
                <Stack role="listitem" gap={2} direction="horizontal" className="mb-3 small" key={id}>
                  <span>{bulletNumber}</span>
                  <div className="col-5 pl-0">
                    <Truncate>
                      {video?.name}
                    </Truncate>
                  </div>
                  <div className="col-6 p-0">
                    {video.status === RequestStatus.FAILED ? (
                      <span className="row m-0 justify-content-end font-weight-bold">
                        {video.status.toUpperCase()}
                      </span>
                    ) : (
                      <ProgressBar now={video.uploadPercentage} variant="info" />
                    )}
                  </div>
                  {getIcon()}
                </Stack>
              );
            })}
          </div>
        </ModalDialog.Body>
      </Scrollable>
      <ModalDialog.Footer>
        <ActionRow>
          <Button onClick={handleUploadCancel}>
            {intl.formatMessage(messages.videoUploadTrackerAlertCancelLabel)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

UploadTrackerModal.propTypes = {
  isUploadTrackerOpen: PropTypes.bool.isRequired,
  handleUploadCancel: PropTypes.func.isRequired,
  currentUploadingIdsRef: PropTypes.shape({
    uploadData: PropTypes.shape({
      name: PropTypes.string,
      status: PropTypes.string,
      uploadPercentage: PropTypes.number,
    }).isRequired,
    uploadCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default UploadTrackerModal;
