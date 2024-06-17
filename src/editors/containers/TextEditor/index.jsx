import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Spinner,
  Toast,
} from '@openedx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

import EditorContainer from '../EditorContainer';
import RawEditor from '../../sharedComponents/RawEditor';
import * as hooks from './hooks';
import messages from './messages';
import TinyMceWidget from '../../sharedComponents/TinyMceWidget';
import { prepareEditorRef, replaceStaticWithAsset } from '../../sharedComponents/TinyMceWidget/hooks';

export const TextEditor = ({
  onClose,
  returnFunction,
  // redux
  showRawEditor,
  blockValue,
  blockFailed,
  initializeEditor,
  blockFinished,
  learningContextId,
  // inject
  intl,
}) => {
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  const editorContent = blockValue ? replaceStaticWithAsset({
    initialContent: blockValue.data.data,
    learningContextId,
  }) : '';

  if (!refReady) { return null; }

  const selectEditor = () => {
    if (showRawEditor) {
      return (
        <RawEditor
          editorRef={editorRef}
          content={blockValue}
        />
      );
    }
    return (
      <TinyMceWidget
        editorType="text"
        editorRef={editorRef}
        editorContentHtml={editorContent}
        setEditorRef={setEditorRef}
        minHeight={500}
        height="100%"
        initializeEditor={initializeEditor}
      />
    );
  };

  return (
    <EditorContainer
      getContent={hooks.getContent({ editorRef, showRawEditor })}
      onClose={onClose}
      returnFunction={returnFunction}
    >
      <div className="editor-body h-75 overflow-auto">
        <Toast show={blockFailed} onClose={hooks.nullMethod}>
          <FormattedMessage {...messages.couldNotLoadTextContext} />
        </Toast>

        {(!blockFinished)
          ? (
            <div className="text-center p-6">
              <Spinner
                animation="border"
                className="m-3"
                screenreadertext={intl.formatMessage(messages.spinnerScreenReaderText)}
              />
            </div>
          ) : (selectEditor())}
      </div>
    </EditorContainer>
  );
};
TextEditor.defaultProps = {
  blockValue: null,
  blockFinished: null,
  returnFunction: null,
};
TextEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  returnFunction: PropTypes.func,
  // redux
  blockValue: PropTypes.shape({
    data: PropTypes.shape({ data: PropTypes.string }),
  }),
  blockFailed: PropTypes.bool.isRequired,
  initializeEditor: PropTypes.func.isRequired,
  showRawEditor: PropTypes.bool.isRequired,
  blockFinished: PropTypes.bool,
  learningContextId: PropTypes.string.isRequired,
  // inject
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  blockValue: selectors.app.blockValue(state),
  blockFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  showRawEditor: selectors.app.showRawEditor(state),
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  learningContextId: selectors.app.learningContextId(state),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(TextEditor));
