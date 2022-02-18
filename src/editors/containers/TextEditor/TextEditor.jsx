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

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Spinner,
  Toast,
} from '@edx/paragon';

import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import {
  editorConfig,
  modalToggle,
  nullMethod,
} from './hooks';
import messages from './messages';
import ImageUploadModal from './ImageUpload/ImageUploadModal';

export const TextEditor = ({
  setEditorRef,
  // redux
  blockValue,
  blockFailed,
  blockFinished,
  initializeEditor,
}) => {
  console.log({ blockValue, blockFailed, blockFinished, test: 1 });
  const { isOpen, openModal, closeModal } = modalToggle();

  return (
    <div className="editor-body h-75">
      <ImageUploadModal
        isOpen={isOpen}
        close={closeModal}
      />

      <Toast show={blockFailed} onClose={nullMethod}>
        <FormattedMessage {...messages.couldNotLoadTextContext} />
      </Toast>

      {(!blockFinished)
        ? (
          <div className="text-center p-6">
            <Spinner animation="border" className="m-3" screenreadertext="loading" />
          </div>
        )
        : (
          <Editor {...editorConfig({ setEditorRef, blockValue, openModal, initializeEditor })} />
        )}
    </div>
  );
};
TextEditor.defaultProps = {
  blockValue: null,
};
TextEditor.propTypes = {
  setEditorRef: PropTypes.func.isRequired,
  // redux
  blockValue: PropTypes.shape({
    data: PropTypes.shape({ data: PropTypes.string }),
  }),
  blockFailed: PropTypes.bool.isRequired,
  blockFinished: PropTypes.bool.isRequired,
  initializeEditor: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  blockValue: selectors.app.blockValue(state),
  blockFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
});

export const mapDispatchToProps = {
 initializeEditor: actions.app.initializeEditor,
};

export default connect(mapStateToProps, mapDispatchToProps)(TextEditor);
