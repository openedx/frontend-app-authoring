import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl } from '@edx/frontend-platform/i18n';
import tinyMCEKeys from '../../data/constants/tinyMCE';
import ImageSettingsModal from './ImageSettingsModal';
import SelectImageModal from './SelectImageModal';
import * as module from '.';
import { updateImageDimensions } from '../TinyMceWidget/hooks';

export const propsString = (props) => (
  Object.keys(props).map((key) => `${key}="${props[key]}"`).join(' ')
);

export const imgProps = ({
  settings,
  selection,
  lmsEndpointUrl,
  editorType,
}) => {
  let url = selection?.externalUrl;
  if (url?.startsWith(lmsEndpointUrl) && editorType !== 'expandable') {
    const sourceEndIndex = lmsEndpointUrl.length;
    url = url.substring(sourceEndIndex);
  }
  return {
    src: url,
    alt: settings.isDecorative ? '' : settings.altText,
    width: settings.dimensions.width,
    height: settings.dimensions.height,
  };
};

export const saveToEditor = ({
  settings, selection, lmsEndpointUrl, editorType, editorRef,
}) => {
  const newImgTag = module.hooks.imgTag({
    settings,
    selection,
    lmsEndpointUrl,
    editorType,
  });

  editorRef.current.execCommand(
    tinyMCEKeys.commands.insertContent,
    false,
    newImgTag,
  );
};

export const updateImagesRef = ({
  images, selection, height, width, newImage,
}) => {
  const { result: mappedImages, foundMatch: imageAlreadyExists } = updateImageDimensions({
    images: images.current, url: selection.externalUrl, height, width,
  });

  images.current = imageAlreadyExists ? mappedImages : [...images.current, newImage];
};

export const updateReactState = ({
  settings, selection, setSelection, images,
}) => {
  const { height, width } = settings.dimensions;
  const newImage = {
    externalUrl: selection.externalUrl,
    altText: settings.altText,
    width,
    height,
  };

  updateImagesRef({
    images, selection, height, width, newImage,
  });

  setSelection(newImage);
};

export const hooks = {
  createSaveCallback: ({
    close,
    ...args
  }) => (
    settings,
  ) => {
    saveToEditor({ settings, ...args });
    updateReactState({ settings, ...args });

    close();
    args.setSelection(null);
  },
  onClose: ({ clearSelection, close }) => () => {
    clearSelection();
    close();
  },
  imgTag: ({
    settings,
    selection,
    lmsEndpointUrl,
    editorType,
  }) => {
    const props = module.imgProps({
      settings,
      selection,
      lmsEndpointUrl,
      editorType,
    });
    return `<img ${propsString(props)} />`;
  },
  updateReactState,
  updateImagesRef,
  saveToEditor,
  imgProps,
  propsString,
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
  editorType,
  lmsEndpointUrl,
}) => {
  if (selection && selection.externalUrl) {
    return (
      <ImageSettingsModal
        {...{
          isOpen,
          close: module.hooks.onClose({ clearSelection, close }),
          selection,
          images,
          saveToEditor: module.hooks.createSaveCallback({
            close,
            images,
            editorRef,
            editorType,
            selection,
            setSelection,
            lmsEndpointUrl,
            clearSelection,
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
  editorType: null,
  selection: null,
};
ImageUploadModal.propTypes = {
  clearSelection: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
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
  lmsEndpointUrl: PropTypes.string.isRequired,
  editorType: PropTypes.string,
};

export default injectIntl(ImageUploadModal);
