import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { blockTypes } from './data/constants/app';
import { thunkActions } from './data/redux';

import TextEditor from './containers/TextEditor/TextEditor';
import VideoEditor from './containers/VideoEditor/VideoEditor';
import ProblemEditor from './containers/ProblemEditor/ProblemEditor';
import EditorFooter from './components/EditorFooter';
import EditorHeader from './components/EditorHeader';

import messages from './messages';
import * as hooks from './hooks';

export const supportedEditors = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
};

export const Editor = ({
  courseId,
  blockType,
  blockId,
  lmsEndpointUrl,
  studioEndpointUrl,
  // redux
  initialize,
}) => {
  hooks.initializeApp({
    initialize,
    data: {
      blockId,
      blockType,
      courseId,
      lmsEndpointUrl,
      studioEndpointUrl,
    },
  });

  const { editorRef, refReady, setEditorRef } = hooks.prepareEditorRef();

  const EditorComponent = supportedEditors[blockType];

  return (
    <div className="d-flex flex-column vh-100">
      <div
        className="pgn__modal-fullscreen"
        role="dialog"
        aria-label={blockType}
      >
        {refReady && (
          <>
            <EditorHeader editorRef={editorRef} />
            {(EditorComponent !== undefined)
              ? <EditorComponent {...{ setEditorRef, editorRef }} />
              : <FormattedMessage {...messages.couldNotFindEditor} />}
            <EditorFooter editorRef={editorRef} />
          </>
        )}

      </div>
    </div>
  );
};
Editor.defaultProps = {
  courseId: null,
  blockId: null,
  lmsEndpointUrl: null,
  studioEndpointUrl: null,
};

Editor.propTypes = {
  courseId: PropTypes.string,
  blockType: PropTypes.string.isRequired,
  blockId: PropTypes.string,
  lmsEndpointUrl: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
  // redux
  initialize: PropTypes.func.isRequired,
};
export const mapStateToProps = () => ({});
export const mapDispatchToProps = {
  initialize: thunkActions.app.initialize,
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
