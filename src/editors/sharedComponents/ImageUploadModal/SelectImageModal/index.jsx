import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import * as hooks from './hooks';
import { acceptedImgKeys } from './utils';
import SelectionModal from '../../SelectionModal';
import messages from './messages';
import { RequestKeys } from '../../../data/constants/requests';
import { selectors } from '../../../data/redux';

const SelectImageModal = ({
  isOpen,
  close,
  setSelection,
  clearSelection,
  images,
}) => {
  // Redux state using useSelector
  const isLoaded = useSelector((state) => selectors.requests.isFinished(
    state,
    { requestKey: RequestKeys.fetchImages },
  ));
  const isFetchError = useSelector((state) => selectors.requests.isFailed(
    state,
    { requestKey: RequestKeys.fetchImages },
  ));
  const isUploadError = useSelector((state) => selectors.requests.isFailed(
    state,
    { requestKey: RequestKeys.uploadAsset },
  ));
  const isLibrary = useSelector(selectors.app.isLibrary);
  const imageCount = useSelector((state) => state.app.imageCount);

  const {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  } = hooks.imgHooks({
    setSelection,
    clearSelection,
    images: images.current,
    imageCount,
  });

  const modalMessages = {
    confirmMsg: messages.nextButtonLabel,
    titleMsg: messages.titleLabel,
    uploadButtonMsg: messages.uploadButtonLabel,
    fetchError: messages.fetchImagesError,
    uploadError: messages.uploadImageError,
  };

  return (
    <SelectionModal
      {...{
        isOpen,
        close,
        galleryError,
        inputError,
        fileInput,
        galleryProps,
        searchSortProps,
        selectBtnProps,
        acceptedFiles: acceptedImgKeys,
        modalMessages,
        isLoaded,
        isFetchError,
        isUploadError,
        isLibrary,
      }}
    />
  );
};

SelectImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  setSelection: PropTypes.func.isRequired,
  clearSelection: PropTypes.func.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export const SelectImageModalInternal = SelectImageModal; // For testing
export default SelectImageModal;
