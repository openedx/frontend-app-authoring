import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
  // redux
  isLoaded,
  isFetchError,
  isUploadError,
  isLibrary,
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
  // redux
  isLoaded: PropTypes.bool.isRequired,
  isFetchError: PropTypes.bool.isRequired,
  isUploadError: PropTypes.bool.isRequired,
  imageCount: PropTypes.number.isRequired,
  isLibrary: PropTypes.bool,
};

export const mapStateToProps = (state) => ({
  isLoaded: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchImages }),
  isFetchError: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchImages }),
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadAsset }),
  isLibrary: selectors.app.isLibrary(state),
  imageCount: state.app.imageCount,
});

export const mapDispatchToProps = {};

export const SelectImageModalInternal = SelectImageModal; // For testing only
export default connect(mapStateToProps, mapDispatchToProps)(SelectImageModal);
