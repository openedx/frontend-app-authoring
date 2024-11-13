import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl } from '@edx/frontend-platform/i18n';
import * as tinyMCEKeys from '../../data/constants/tinyMCE';
import ImageSettingsModal from './ImageSettingsModal';
import SelectImageModal from './SelectImageModal';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
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
  isLibrary,
}) => {
  let url = selection?.externalUrl;
  if (url?.startsWith(lmsEndpointUrl) && editorType !== 'expandable') {
    const sourceEndIndex = lmsEndpointUrl.length;
    url = url.substring(sourceEndIndex);
  }
  if (isLibrary) {
    const index = url.indexOf('static/');
    url = url.substring(index);
  }
  return {
    src: url,
    alt: settings.isDecorative ? '' : settings.altText,
    width: settings.dimensions.width,
    height: settings.dimensions.height,
  };
};

export const saveToEditor = ({
  settings, selection, lmsEndpointUrl, editorType, editorRef, isLibrary,
}) => {
  const newImgTag = module.hooks.imgTag({
    settings,
    selection,
    lmsEndpointUrl,
    editorType,
    isLibrary,
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

  // eslint-disable-next-line no-param-reassign
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
    isLibrary,
  }) => {
    const props = module.imgProps({
      settings,
      selection,
      lmsEndpointUrl,
      editorType,
      isLibrary,
    });
    return `<img ${propsString(props)} />`;
  },
  updateReactState,
  updateImagesRef,
  saveToEditor,
  imgProps,
  propsString,
};

const ImageUploadModal = ({
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
  isLibrary,
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
            isLibrary,
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
  isLibrary: PropTypes.string,
};

export const ImageUploadModalInternal = ImageUploadModal; // For testing only
export default injectIntl(ImageUploadModal);
