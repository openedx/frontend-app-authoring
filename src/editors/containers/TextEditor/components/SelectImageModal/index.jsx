import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Button, Stack } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { thunkActions } from '../../../../data/redux';
import hooks from './hooks';
import { acceptedImgKeys } from './utils';
import messages from './messages';
import BaseModal from '../BaseModal';
import ErrorAlert from './ErrorAlert';
import SearchSort from './SearchSort';
import Gallery from './Gallery';

// internationalization
// intel
// inject intel
// some kind of date thing (FormattedMessage and FormattedDate)

// TODO testing (testUtils has formatted message)

export const SelectImageModal = ({
  isOpen,
  close,
  setSelection,
  // injected
  intl,
  // redux
  fetchImages,
  uploadImage,
}) => {
  const {
    searchSortProps,
    galleryProps,
    selectBtnProps,
    fileInput,
  } = hooks.imgHooks({ fetchImages, uploadImage, setSelection });

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
      <Stack gap={3}>
        <SearchSort {...searchSortProps} />
        <Gallery {...galleryProps} />
        <input
          accept={Object.values(acceptedImgKeys).join()}
          className="upload d-none"
          onChange={fileInput.addFile}
          ref={fileInput.ref}
          type="file"
        />
      </Stack>
    </BaseModal>
  );
};

SelectImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  setSelection: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
  // redux
  fetchImages: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
};

export const mapStateToProps = () => ({});
export const mapDispatchToProps = {
  fetchImages: thunkActions.app.fetchImages,
  uploadImage: thunkActions.app.uploadImage,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SelectImageModal));
