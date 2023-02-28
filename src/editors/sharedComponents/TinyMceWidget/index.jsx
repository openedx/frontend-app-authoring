import React from 'react';
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

import ImageUploadModal from '../ImageUploadModal';
import SourceCodeModal from '../SourceCodeModal';
import * as hooks from './hooks';

export const TinyMceWidget = ({
  editorType,
  editorRef,
  assets,
  isLibrary,
  ...props
}) => {
  const { isImgOpen, openImgModal, closeImgModal } = hooks.imgModalToggle();
  const { isSourceCodeOpen, openSourceCodeModal, closeSourceCodeModal } = hooks.sourceCodeModalToggle(editorRef);
  const images = hooks.filterAssets({ assets });
  const imageSelection = hooks.selectedImage(null);
  return (
    <>
      {isLibrary ? null : (
        <ImageUploadModal
          isOpen={isImgOpen}
          close={closeImgModal}
          editorRef={editorRef}
          images={images}
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
        {
          ...hooks.editorConfig({
            openImgModal,
            openSourceCodeModal,
            editorType,
            editorRef,
            isLibrary,
            images,
            setSelection: imageSelection.setSelection,
            clearSelection: imageSelection.clearSelection,
            ...props,
          })
        }
      />
    </>
  );
};
TinyMceWidget.defaultProps = {
  isLibrary: null,
  assets: null,
  editorType: null,
  editorRef: null,
};
TinyMceWidget.propTypes = {
  editorType: PropTypes.string,
  isLibrary: PropTypes.bool,
  assets: PropTypes.shape({}),
  editorRef: PropTypes.shape({}),
};

export default TinyMceWidget;
