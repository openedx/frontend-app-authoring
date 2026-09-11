import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';
import { getConfig } from '@edx/frontend-platform';

import 'tinymce';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/table';

import ImageUploadModal from '../ImageUploadModal';
import SourceCodeModal from '../SourceCodeModal';
import * as hooks from './hooks';
import './customTinyMcePlugins/embedIframePlugin';
import { isLibraryV1Key } from '../../../generic/key-utils';

export { prepareEditorRef } from './hooks';

const editorConfigDefaultProps = {
  setEditorRef: undefined,
  placeholder: undefined,
  initializeEditor: undefined,
  updateContent: undefined,
  content: undefined,
  minHeight: undefined,
};

const editorConfigPropTypes = {
  setEditorRef: PropTypes.func,
  placeholder: PropTypes.any,
  initializeEditor: PropTypes.func,
  updateContent: PropTypes.func,
  content: PropTypes.any,
  minHeight: PropTypes.any,
};

const TinyMceWidget = ({
  editorType,
  editorRef,
  disabled,
  id,
  editorContentHtml, // editorContent in html form
  learningContextId,
  images,
  enableImageUpload,
  isLibrary,
  onChange,
  staticRootUrl,
  ...editorConfig
}) => {
  const { isImgOpen, openImgModal, closeImgModal } = hooks.imgModalToggle();
  const { isSourceCodeOpen, openSourceCodeModal, closeSourceCodeModal } = hooks.sourceCodeModalToggle(editorRef);
  const { imagesRef } = hooks.useImages({ images, editorContentHtml });
  const imageSelection = hooks.selectedImage(null);

  return (
    <>
      {enableImageUpload && (
        <ImageUploadModal
          isOpen={isImgOpen}
          close={closeImgModal}
          editorRef={editorRef}
          images={imagesRef}
          editorType={editorType}
          lmsEndpointUrl={getConfig().LMS_BASE_URL}
          isLibrary
          {...imageSelection}
        />
      )}
      {editorType === 'text' && (
        <SourceCodeModal
          isOpen={isSourceCodeOpen}
          close={closeSourceCodeModal}
          editorRef={editorRef}
        />
      )}
      <Editor
        id={id}
        disabled={disabled}
        onEditorChange={onChange}
        // TinyMCE 7 is GPL-2.0-or-later licensed. Declaring the open source license key
        // silences the "running in evaluation mode" console warning. Operators using premium
        // plugins must provide their commercial license key instead.
        licenseKey={getConfig().TINYMCE_LICENSE_KEY || 'gpl'}
        {
          // @ts-ignore FIXME: this will have type errors until `editorConfig` gets proper type definitions.
          ...hooks.editorConfig({
            openImgModal,
            openSourceCodeModal,
            editorType,
            // @ts-ignore FIXME: 'editorRef' is not an accepted parameter of editorConfig()
            editorRef,
            enableImageUpload: isLibraryV1Key(learningContextId) ? false : enableImageUpload,
            learningContextId,
            images: imagesRef,
            editorContentHtml,
            staticRootUrl,
            ...imageSelection,
            ...editorConfig,
          })
        }
      />
    </>
  );
};
TinyMceWidget.defaultProps = {
  isLibrary: null,
  editorType: null,
  editorRef: null,
  lmsEndpointUrl: '',
  studioEndpointUrl: '',
  images: null,
  id: null,
  disabled: false,
  editorContentHtml: undefined,
  enableImageUpload: true,
  onChange: () => ({}),
  ...editorConfigDefaultProps,
};
TinyMceWidget.propTypes = {
  learningContextId: PropTypes.string.isRequired,
  editorType: PropTypes.string,
  isLibrary: PropTypes.bool,
  images: PropTypes.shape({}),
  editorRef: PropTypes.shape({}),
  lmsEndpointUrl: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  editorContentHtml: PropTypes.string,
  enableImageUpload: PropTypes.bool,
  onChange: PropTypes.func,
  ...editorConfigPropTypes,
};

export const TinyMceWidgetInternal = TinyMceWidget; // For testing only
export default TinyMceWidget;
