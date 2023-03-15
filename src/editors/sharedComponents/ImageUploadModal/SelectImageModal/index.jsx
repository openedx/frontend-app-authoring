import PropTypes from 'prop-types';
import hooks from './hooks';
import { acceptedImgKeys } from './utils';
import SelectionModal from '../../SelectionModal';
import messages from './messages';

export const SelectImageModal = ({
  isOpen,
  close,
  setSelection,
  clearSelection,
  images,
}) => {
  const {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  } = hooks.imgHooks({ setSelection, clearSelection, images });

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

export default SelectImageModal;
