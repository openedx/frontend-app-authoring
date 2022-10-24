import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl } from '@edx/frontend-platform/i18n';

import { selectors } from '../../../data/redux';
import tinyMCEKeys from '../../../data/constants/tinyMCE';
import ImageSettingsModal from './ImageSettingsModal';
import SelectImageModal from './SelectImageModal';
import * as module from './ImageUploadModal';

export const propsString = (props) => (
  Object.keys(props).map((key) => `${key}="${props[key]}"`).join(' ')
);

export const imgProps = ({
  settings,
  selection,
  lmsEndpointUrl,
}) => {
  let url = selection.externalUrl;
  if (url.startsWith(lmsEndpointUrl)) {
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

export const hooks = {
  createSaveCallback: ({
    close,
    editorRef,
    setSelection,
    selection,
    lmsEndpointUrl,
  }) => (
    settings,
  ) => {
    editorRef.current.execCommand(
      tinyMCEKeys.commands.insertContent,
      false,
      module.hooks.imgTag({
        settings,
        selection,
        lmsEndpointUrl,
      }),
    );
    setSelection(null);
    close();
  },
  onClose: ({ clearSelection, close }) => () => {
    clearSelection();
    close();
  },
  imgTag: ({ settings, selection, lmsEndpointUrl }) => {
    const props = module.imgProps({ settings, selection, lmsEndpointUrl });
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
  // redux
  lmsEndpointUrl,
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
            lmsEndpointUrl,
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
  lmsEndpointUrl: PropTypes.string.isRequired,
};

export const mapStateToProps = (state) => ({
  lmsEndpointUrl: selectors.app.lmsEndpointUrl(state),
});

export const mapDispatchToProps = {};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ImageUploadModal));
