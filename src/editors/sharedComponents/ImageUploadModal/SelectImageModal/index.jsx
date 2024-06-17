import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import hooks from './hooks';
import { acceptedImgKeys } from './utils';
import SelectionModal from '../../SelectionModal';
import messages from './messages';
import { RequestKeys } from '../../../data/constants/requests';
import { selectors } from '../../../data/redux';

export const SelectImageModal = ({
  isOpen,
  close,
  setSelection,
  clearSelection,
  images,
  // redux
  isLoaded,
  isFetchError,
  isUploadError,
  imageCount,
}) => {
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
  // redux
  isLoaded: PropTypes.bool.isRequired,
  isFetchError: PropTypes.bool.isRequired,
  isUploadError: PropTypes.bool.isRequired,
  imageCount: PropTypes.number.isRequired,
};

export const mapStateToProps = (state) => ({
  isLoaded: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchImages }),
  isFetchError: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchImages }),
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadAsset }),
  imageCount: state.app.imageCount,
});

export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SelectImageModal);
