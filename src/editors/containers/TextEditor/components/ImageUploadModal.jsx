import React from 'react';
import PropTypes from 'prop-types';

import ImageSettingsModal from './ImageSettingsModal';
import SelectImageModal from './SelectImageModal';

const ImageUploadModal = ({
  // eslint-disable-next-line
  editorRef,
  isOpen,
  close,
}) => {
  // selected image file reference data object.
  // existance of this field determines which child modal is displayed
  const [selection, setSelection] = React.useState(null);
  const clearSelection = () => setSelection(null);
  const saveToEditor = (settings) => {
    // eslint-disable-next-line
    console.log({ selection, settings });
    // tell editor ref to insert content at cursor location();
  };
  const closeAndReset = () => {
    setSelection(null);
    close();
  };
  if (selection) {
    return (
      <ImageSettingsModal
        {...{
          isOpen,
          close: closeAndReset,
          selection,
          saveToEditor,
          returnToSelection: clearSelection,
        }}
      />
    );
  }
  return (<SelectImageModal {...{ isOpen, close, setSelection }} />);
};

ImageUploadModal.defaultProps = {
  editorRef: null,
};
ImageUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};
export default ImageUploadModal;
