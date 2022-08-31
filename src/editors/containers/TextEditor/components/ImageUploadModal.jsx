import React from 'react';
import PropTypes from 'prop-types';

import tinyMCEKeys from '../../../data/constants/tinyMCE';
import ImageSettingsModal from './ImageSettingsModal';
import SelectImageModal from './SelectImageModal';
import * as module from './ImageUploadModal';

export const propsString = (props) => (
  Object.keys(props).map((key) => `${key}="${props[key]}"`).join(' ')
);

export const imgProps = ({ settings, selection }) => ({
  src: selection.url,
  alt: settings.isDecorative ? '' : settings.altText,
  width: settings.dimensions.width,
  height: settings.dimensions.height,
});

export const hooks = {
  createSaveCallback: ({
    close,
    editorRef,
    setSelection,
    selection,
  }) => (
    settings,
  ) => {
    editorRef.current.execCommand(
      tinyMCEKeys.commands.insertContent,
      false,
      module.hooks.imgTag({ settings, selection }),
    );
    setSelection(null);
    close();
  },
  onClose: ({ clearSelection, close }) => () => {
    clearSelection();
    close();
  },
  imgTag: ({ settings, selection }) => {
    const props = module.imgProps({ settings, selection });
    return `<img ${propsString(props)} />`;
  },
};

export const ImageUploadModal = ({
  // eslint-disable-next-line
  editorRef,
  isOpen,
  close,
  clearSelection,
  selection,
  setSelection,
  images,
}) => {
  if (selection) {
    return (
      <ImageSettingsModal
        {...{
          isOpen,
          close: module.hooks.onClose({ clearSelection, close }),
          selection,
          saveToEditor: module.hooks.createSaveCallback({
            close,
            editorRef,
            selection,
            setSelection,
          }),
          returnToSelection: clearSelection,
        }}
      />
    );
  }
  return (
    <SelectImageModal
      {...{
        isOpen,
        close,
        setSelection,
        clearSelection,
        images,
      }}
    />
  );
};

ImageUploadModal.defaultProps = {
  editorRef: null,
  selection: null,
};
ImageUploadModal.propTypes = {
  clearSelection: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  isOpen: PropTypes.bool.isRequired,
  selection: PropTypes.shape({
    url: PropTypes.string,
    externalUrl: PropTypes.string,
    altText: PropTypes.bool,
  }),
  setSelection: PropTypes.func.isRequired,
  images: PropTypes.shape({}).isRequired,
};
export default ImageUploadModal;
