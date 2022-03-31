import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';

import 'tinymce';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/link';
import 'tinymce/plugins/table';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';

import {
  Spinner,
  Toast,
} from '@edx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import {
  editorConfig,
  modalToggle,
  nullMethod,
  selectedImage,
} from './hooks';
import ImageUploadModal from './components/ImageUploadModal';
import messages from './messages';

export const TextEditor = ({
  setEditorRef,
  editorRef,
  // redux
  blockValue,
  blockFailed,
  blockFinished,
  initializeEditor,
  // inject
  intl,
}) => {
  const { isOpen, openModal, closeModal } = modalToggle();

  // selected image file reference data object.
  // this field determines the step of the ImageUploadModal
  const imageSelection = selectedImage(null);

  return (
    <div className="editor-body h-75">
      <ImageUploadModal
        isOpen={isOpen}
        close={closeModal}
        editorRef={editorRef}
        {...imageSelection}
      />

      <Toast show={blockFailed} onClose={nullMethod}>
        <FormattedMessage {...messages.couldNotLoadTextContext} />
      </Toast>

      {(!blockFinished)
        ? (
          <div className="text-center p-6">
            <Spinner animation="border" className="m-3" screenreadertext={intl.formatMessage(messages.spinnerScreenReaderText)} />
          </div>
        )
        : (
          <Editor
            {...editorConfig({
              setEditorRef,
              blockValue,
              openModal,
              initializeEditor,
              setSelection: imageSelection.setSelection,
              clearSelection: imageSelection.clearSelection,
            })}
          />
        )}
    </div>
  );
};
TextEditor.defaultProps = {
  blockValue: null,
  editorRef: null,
};
TextEditor.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  setEditorRef: PropTypes.func.isRequired,
  // redux
  blockValue: PropTypes.shape({
    data: PropTypes.shape({ data: PropTypes.string }),
  }),
  blockFailed: PropTypes.bool.isRequired,
  blockFinished: PropTypes.bool.isRequired,
  initializeEditor: PropTypes.func.isRequired,
  // inject
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  blockValue: selectors.app.blockValue(state),
  blockFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(TextEditor));
