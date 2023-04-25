import React from 'react';
import PropTypes from 'prop-types';

import { Button, Stack } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';

import BaseModal from '../BaseModal';
import SearchSort from './SearchSort';
import Gallery from './Gallery';
import FileInput from '../FileInput';
import ErrorAlert from '../ErrorAlerts/ErrorAlert';
import FetchErrorAlert from '../ErrorAlerts/FetchErrorAlert';
import UploadErrorAlert from '../ErrorAlerts/UploadErrorAlert';

export const SelectionModal = ({
  isOpen,
  close,
  size,
  isFullscreenScroll,
  galleryError,
  inputError,
  fileInput,
  galleryProps,
  searchSortProps,
  selectBtnProps,
  acceptedFiles,
  modalMessages,
  isLoaded,
  isFetchError,
  isUploadError,
  // injected
  intl,
}) => {
  const {
    confirmMsg,
    uploadButtonMsg,
    titleMsg,
    fetchError,
    uploadError,
  } = modalMessages;

  let background = '#FFFFFF';
  let showGallery = true;
  if (isLoaded && !isFetchError && !isUploadError && !inputError.show) {
    background = '#EBEBEB';
  } else if (isLoaded) {
    showGallery = false;
  }

  const galleryPropsValues = {
    isLoaded,
    show: showGallery,
    ...galleryProps,
  };
  return (
    <BaseModal
      close={close}
      confirmAction={(
        <Button {...selectBtnProps} variant="primary">
          <FormattedMessage {...confirmMsg} />
        </Button>
      )}
      isOpen={isOpen}
      size={size}
      isFullscreenScroll={isFullscreenScroll}
      footerAction={(
        <Button iconBefore={Add} onClick={fileInput.click} variant="link">
          <FormattedMessage {...uploadButtonMsg} />
        </Button>
      )}
      title={intl.formatMessage(titleMsg)}
      bodyStyle={{ background, padding: '9px 24px' }}
      headerComponent={(
        <div style={{ zIndex: 10000, margin: '18px 0' }}>
          <SearchSort {...searchSortProps} />
        </div>
      )}
    >
      {/* Error Alerts */}
      <FetchErrorAlert isFetchError={isFetchError} message={fetchError} />
      <UploadErrorAlert isUploadError={isUploadError} message={uploadError} />
      <ErrorAlert
        dismissError={inputError.dismiss}
        hideHeading
        isError={inputError.show}
      >
        <FormattedMessage {...inputError.message} />
      </ErrorAlert>

      {/* User Feedback Alerts */}
      <ErrorAlert
        dismissError={galleryError.dismiss}
        hideHeading
        isError={galleryError.show}
      >
        <FormattedMessage {...galleryError.message} />
      </ErrorAlert>
      <Stack gap={2}>
        <Gallery {...galleryPropsValues} />
        <FileInput fileInput={fileInput} acceptedFiles={Object.values(acceptedFiles).join()} />
      </Stack>
    </BaseModal>
  );
};

SelectionModal.defaultProps = {
  size: 'lg',
  isFullscreenScroll: true,
};

SelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  size: PropTypes.string,
  isFullscreenScroll: PropTypes.bool,
  galleryError: PropTypes.shape({
    dismiss: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    set: PropTypes.func.isRequired,
    message: PropTypes.shape({}).isRequired,
  }).isRequired,
  inputError: PropTypes.shape({
    dismiss: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    set: PropTypes.func.isRequired,
    message: PropTypes.shape({}).isRequired,
  }).isRequired,
  fileInput: PropTypes.shape({
    click: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
  }).isRequired,
  galleryProps: PropTypes.shape({}).isRequired,
  searchSortProps: PropTypes.shape({}).isRequired,
  selectBtnProps: PropTypes.shape({}).isRequired,
  acceptedFiles: PropTypes.shape({}).isRequired,
  modalMessages: PropTypes.shape({
    confirmMsg: PropTypes.shape({}).isRequired,
    uploadButtonMsg: PropTypes.shape({}).isRequired,
    titleMsg: PropTypes.shape({}).isRequired,
    fetchError: PropTypes.shape({}).isRequired,
    uploadError: PropTypes.shape({}).isRequired,
  }).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  isFetchError: PropTypes.bool.isRequired,
  isUploadError: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(SelectionModal);
