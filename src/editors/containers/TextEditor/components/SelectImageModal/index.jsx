import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Button, Stack, Spinner } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { selectors } from '../../../../data/redux';
import { RequestKeys } from '../../../../data/constants/requests';
import { acceptedImgKeys } from './utils';

import hooks from './hooks';
import messages from './messages';
import BaseModal from '../BaseModal';
import SearchSort from './SearchSort';
import Gallery from './Gallery';
import FileInput from '../../../../sharedComponents/FileInput';
import FetchErrorAlert from '../../../../sharedComponents/ErrorAlerts/FetchErrorAlert';
import UploadErrorAlert from '../../../../sharedComponents/ErrorAlerts/UploadErrorAlert';
import ErrorAlert from '../../../../sharedComponents/ErrorAlerts/ErrorAlert';

export const SelectImageModal = ({
  isOpen,
  close,
  setSelection,
  clearSelection,
  images,
  // injected
  intl,
  // redux
  inputIsLoading,
}) => {
  const {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  } = hooks.imgHooks({ setSelection, clearSelection, images });

  return (
    <BaseModal
      close={close}
      confirmAction={(
        <Button {...selectBtnProps} variant="primary">
          <FormattedMessage {...messages.nextButtonLabel} />
        </Button>
      )}
      isOpen={isOpen}
      footerAction={(
        <Button iconBefore={Add} onClick={fileInput.click} variant="link">
          <FormattedMessage {...messages.uploadButtonLabel} />
        </Button>
      )}
      title={intl.formatMessage(messages.titleLabel)}
    >
      {/* Error Alerts */}
      <FetchErrorAlert message={messages.fetchImagesError} />
      <UploadErrorAlert message={messages.uploadImageError} />
      <ErrorAlert
        dismissError={inputError.dismiss}
        hideHeading
        isError={inputError.show}
      >
        <FormattedMessage {...messages.fileSizeError} />
      </ErrorAlert>

      {/* User Feedback Alerts */}
      <ErrorAlert
        dismissError={galleryError.dismiss}
        hideHeading
        isError={galleryError.show}
      >
        <FormattedMessage {...messages.selectImageError} />
      </ErrorAlert>
      <Stack gap={3}>
        <SearchSort {...searchSortProps} />
        {!inputIsLoading ? <Gallery {...galleryProps} /> : (
          <Spinner
            animation="border"
            className="mie-3"
            screenReaderText={intl.formatMessage(messages.loading)}
          />
        )}
        <FileInput fileInput={fileInput} acceptedFiles={Object.values(acceptedImgKeys).join()} />
      </Stack>
    </BaseModal>
  );
};

SelectImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  setSelection: PropTypes.func.isRequired,
  clearSelection: PropTypes.func.isRequired,
  images: PropTypes.shape({}).isRequired,
  // injected
  intl: intlShape.isRequired,
  // redux
  inputIsLoading: PropTypes.bool.isRequired,
};

export const mapStateToProps = (state) => ({
  inputIsLoading: selectors.requests.isPending(state, { requestKey: RequestKeys.uploadAsset }),
});

export const mapDispatchToProps = {};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SelectImageModal));
