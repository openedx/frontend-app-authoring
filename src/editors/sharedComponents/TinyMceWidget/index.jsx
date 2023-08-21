import React from 'react';
import { Provider, connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';

import 'tinymce';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/quickbars';

import store from '../../data/store';
import { selectors } from '../../data/redux';
import ImageUploadModal from '../ImageUploadModal';
import SourceCodeModal from '../SourceCodeModal';
import * as hooks from './hooks';

const editorConfigDefaultProps = {
  setEditorRef: undefined,
  placeholder: undefined,
  initializeEditor: undefined,
  setSelection: undefined,
  updateContent: undefined,
  content: undefined,
  minHeight: undefined,
};

const editorConfigPropTypes = {
  setEditorRef: PropTypes.func,
  placeholder: PropTypes.any,
  initializeEditor: PropTypes.func,
  setSelection: PropTypes.func,
  updateContent: PropTypes.func,
  content: PropTypes.any,
  minHeight: PropTypes.any,
};

export const TinyMceWidget = ({
  editorType,
  editorRef,
  disabled,
  id,
  editorContentHtml, // editorContent in html form
  // redux
  assets,
  isLibrary,
  lmsEndpointUrl,
  studioEndpointUrl,
  onChange,
  ...editorConfig
}) => {
  const { isImgOpen, openImgModal, closeImgModal } = hooks.imgModalToggle();
  const { isSourceCodeOpen, openSourceCodeModal, closeSourceCodeModal } = hooks.sourceCodeModalToggle(editorRef);
  const { imagesRef } = hooks.useImages({ assets, editorContentHtml });

  const imageSelection = hooks.selectedImage(null);

  return (
    <Provider store={store}>
      {isLibrary ? null : (
        <ImageUploadModal
          isOpen={isImgOpen}
          close={closeImgModal}
          editorRef={editorRef}
          images={imagesRef}
          editorType={editorType}
          lmsEndpointUrl={lmsEndpointUrl}
          {...imageSelection}
        />
      )}
      {editorType === 'text' ? (
        <SourceCodeModal
          isOpen={isSourceCodeOpen}
          close={closeSourceCodeModal}
          editorRef={editorRef}
        />
      ) : null}
      <Editor
        id={id}
        disabled={disabled}
        onEditorChange={onChange}
        {
          ...hooks.editorConfig({
            openImgModal,
            openSourceCodeModal,
            editorType,
            editorRef,
            isLibrary,
            lmsEndpointUrl,
            studioEndpointUrl,
            images: imagesRef,
            editorContentHtml,
            ...imageSelection,
            ...editorConfig,
          })
        }
      />
    </Provider>
  );
};
TinyMceWidget.defaultProps = {
  isLibrary: null,
  editorType: null,
  editorRef: null,
  lmsEndpointUrl: null,
  studioEndpointUrl: null,
  assets: null,
  id: null,
  disabled: false,
  editorContentHtml: undefined,
  updateContent: undefined,
  onChange: () => ({}),
  ...editorConfigDefaultProps,
};
TinyMceWidget.propTypes = {
  editorType: PropTypes.string,
  isLibrary: PropTypes.bool,
  assets: PropTypes.shape({}),
  editorRef: PropTypes.shape({}),
  lmsEndpointUrl: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  editorContentHtml: PropTypes.string,
  updateContent: PropTypes.func,
  onChange: PropTypes.func,
  ...editorConfigPropTypes,
};

export const mapStateToProps = (state) => ({
  assets: selectors.app.assets(state),
  lmsEndpointUrl: selectors.app.lmsEndpointUrl(state),
  studioEndpointUrl: selectors.app.studioEndpointUrl(state),
  isLibrary: selectors.app.isLibrary(state),
});

export default (connect(mapStateToProps)(TinyMceWidget));
